import { getVoiceParams, __ } from '../strings';
import { twiml } from 'twilio';
import qs from 'querystring';
import { ParsedRequest } from '../safeHandle';
import { APIGatewayProxyResult } from 'aws-lambda';
import { BiometricType } from '../../engine/BiometricsProvider';
import { provider } from '../../engine/voiceit/provider';
import { putItem } from '../dynamodb';
import { VerificationState, makeCookieHeader } from '.';

export async function handleEnrolment(
    input: ParsedRequest,
    redirect?: { method: string; target: string }
): Promise<APIGatewayProxyResult> {
    const { event, user, language, auth } = input;
    if (auth.state !== VerificationState.ENROLMENT_REQUESTED) {
        throw new Error('Unexpected verification state');
    }
    const body = qs.parse(event.body || '');
    const { RecordingUrl = event.queryStringParameters?.RecordingUrl } = body;
    const { voiceItId } = user;
    if (typeof RecordingUrl !== 'string') {
        throw new Error('Could not retrieve recording URL.');
    }
    if (!voiceItId) {
        throw new Error('VoiceIT user does not exist');
    }

    // Make VoiceIt enrolment
    const { success, complete, next } = await provider.handleEnrolmentResponse(
        {
            biometricType: BiometricType.VOICE,
            recordingUrl: RecordingUrl,
            request: auth.req,
        },
        {
            userId: voiceItId,
            language,
        }
    );

    const response = new twiml.VoiceResponse();
    if (complete) {
        await putItem({
            ...user,
            isEnrolled: true,
        });

        response.say(
            getVoiceParams(language),
            __('enrolment-complete', language)
        );
        // send the user to the resource they originally tried to access
        response.redirect(
            { method: redirect?.method || event.httpMethod },
            redirect?.target || event.path
        );

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml',
                ...makeCookieHeader({
                    state: VerificationState.REGISTERED,
                    sub: user.id,
                }),
            },
            body: response.toString(),
        };
    }

    if (!success) {
        // TODO: warn the user that something went wrong, before triggering a retry
    }

    if (next) {
        // TODO: de-duplicate response construction from `requestEnrolment`
        response.say(
            getVoiceParams(language),
            __(
                'enrol-confirmation',
                { remaining: next.request.recordingsRequired },
                language
            )
        );
        response.say(getVoiceParams(language), __('enrol-message', language));
        response.pause({ length: 1 });
        response.say(getVoiceParams(language), next.phrase);
        response.record({
            // send the recording to the same URL. The cookie we set will ensure the correct handler picks it up
            action: event.path,
            method: event.httpMethod,
            finishOnKey: '#',
            playBeep: true,
            maxLength: 5,
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml',
                ...makeCookieHeader({
                    state: VerificationState.ENROLMENT_REQUESTED,
                    phrase: next.phrase,
                    req: next.request,
                    sub: user.id,
                }),
            },
            body: response.toString(),
        };
    }

    throw new Error('Unexpected state: enrolment failure with no next step');
}
