import { twiml } from 'twilio';
import qs from 'querystring';
import { safeHandle } from '../../../../services/safeHandle';
import { APIGatewayProxyEvent } from 'aws-lambda';
import {
    VoiceItEnrolmentData,
    provider,
} from '../../../../engine/voiceit/provider';
import { BiometricType } from '../../../../engine/BiometricsProvider';
import { getVoiceParams, __ } from '../../../../services/strings';

function parseEnrolmentRequest(
    event: APIGatewayProxyEvent
): VoiceItEnrolmentData {
    try {
        const cookie = event.headers.Cookie?.split(/;\s?/)
            ?.map((x) => x.split('='))
            ?.find(([name]) => name === 'enrolmentRequest')?.[1];
        if (!cookie) throw new Error();
        return JSON.parse(cookie);
    } catch (e) {
        throw new Error('Could not retrieve enrolment request');
    }
}

/**
 * TODO: it would probably be nice to keep this handler in the same file as the previous one, as we have in other places (e.g. use GET to initiate the request, and POST to handle the responses).
 */
// N.B. there is some duplication here with `services/auth/handleEnrolment` but it's tolerable to keep things simple.
export const get = safeHandle(
    async ({ event, user, language }) => {
        const body = qs.parse(event.body || '');
        const {
            RecordingUrl = event.queryStringParameters?.RecordingUrl,
        } = body;
        const { voiceItId } = user;
        const enrolmentRequest = parseEnrolmentRequest(event);
        if (typeof RecordingUrl !== 'string') {
            throw new Error('Could not retrieve recording URL.');
        }
        if (!voiceItId) {
            throw new Error('VoiceIT user does not exist');
        }

        const {
            success,
            complete,
            next,
        } = await provider.handleEnrolmentResponse(
            {
                biometricType: BiometricType.VOICE,
                recordingUrl: RecordingUrl,
                request: enrolmentRequest,
            },
            {
                userId: voiceItId,
                language,
            }
        );
        const response = new twiml.VoiceResponse();
        if (complete) {
            response.say(
                getVoiceParams(language),
                __('enrolment-complete', language)
            );
            // send the user back to the main menu
            response.redirect({ method: 'GET' }, `${language}/menu`);

            // Unset the cookie we previously used
            return { body: response, cookie: { enrolmentRequest: '' } };
        }

        if (!success) {
            // TODO: warn the user that something went wrong and trigger a retry
        }

        if (next) {
            // TODO: de-duplicate response construction from `requestEnrolment` (and `handleEnrolment`)
            response.say(
                getVoiceParams(language),
                __(
                    'enrol-confirmation',
                    { remaining: next.request.recordingsRequired },
                    language
                )
            );
            response.say(
                getVoiceParams(language),
                __('enrol-message', language)
            );
            response.pause({ length: 1 });
            response.say(getVoiceParams(language), next.phrase);
            response.record({
                action: './add/final',
                method: event.httpMethod,
                finishOnKey: '#',
                playBeep: true,
                maxLength: 5,
            });
            return {
                body: response,
                // need to store the new enrolment request so that the next receiver can use it
                cookie: {
                    enrolmentRequest: JSON.stringify(next.request),
                },
            };
        }

        throw new Error(
            'Unexpected state: enrolment failure with no next step'
        );
    },
    {
        requireVerification: true,
        allowEnrolment: false,
    }
);
