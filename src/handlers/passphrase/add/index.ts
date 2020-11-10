import qs from 'qs';
import { twiml } from 'twilio';
import { BiometricType } from '../../../engine/BiometricsProvider';
import {
    provider,
    VoiceItEnrolmentData,
} from '../../../engine/voiceit/provider';
import { putItem } from '../../../services/dynamodb';
import { safeHandle } from '../../../services/safeHandle';
import { getVoiceParams, __ } from '../../../services/strings';

// N.B. there is some overlap here with `services/auth/requestEnrolment` but not enough to worry about
export const get = safeHandle(
    async (request) => {
        const { user, language } = request;
        const response = new twiml.VoiceResponse();
        const enrolmentRequest = await provider.getEnrolmentRequest({
            userId: user.voiceItId,
            language,
        });
        await putItem({
            ...user,
            enrolmentRequest: enrolmentRequest.request,
        });
        response.say(getVoiceParams(language), __('enrol-message', language));
        response.pause({ length: 1 });
        response.say(getVoiceParams(language), enrolmentRequest.phrase);
        response.record({
            action: './add',
            method: 'POST',
            finishOnKey: '#',
            playBeep: true,
            maxLength: 5,
        });
        return response;
    },
    {
        requireVerification: true,
        allowEnrolment: false,
    }
);

// N.B. there is some duplication here with `services/auth/handleEnrolment` but it's tolerable to keep things simple.
export const post = safeHandle(
    async ({ event, user, language }) => {
        const { RecordingUrl } = qs.parse(event.body || '');

        const { voiceItId, enrolmentRequest } = user;
        if (!enrolmentRequest) {
            throw new Error('No enrolment request');
        }
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
                request: enrolmentRequest as VoiceItEnrolmentData,
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
            response.redirect({ method: 'GET' }, `/${language}/menu`);

            return response;
        }

        if (!success) {
            // TODO: warn the user that something went wrong and trigger a retry
        }

        if (next) {
            // TODO: de-duplicate response construction from `requestEnrolment` (and `handleEnrolment`)
            await putItem({
                ...user,
                enrolmentRequest: next.request,
            });
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
                action: './add',
                method: 'POST',
                finishOnKey: '#',
                playBeep: true,
                maxLength: 5,
            });
            return response;
        }

        throw new Error(
            'Unexpected state: enrolment failure with no next step'
        );
    },
    {
        requireVerification: false,
        allowEnrolment: false,
    }
);