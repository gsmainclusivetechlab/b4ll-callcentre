import { getVoiceParams, __ } from '../strings';
import { twiml } from 'twilio';
import { ParsedRequest } from '../safeHandle';
import { APIGatewayProxyResult } from 'aws-lambda';
import { BiometricType } from '../../engine/BiometricsProvider';
import { provider } from '../../engine/voiceit/provider';
import { makeCookieHeader, VerificationState } from '.';

export async function requestVerification(
    input: ParsedRequest
): Promise<APIGatewayProxyResult> {
    const { language, user, event } = input;
    if (!user.isEnrolled) {
        throw new Error('You must be enrolled before accessing this resource.');
    }
    const { voiceItId } = user;
    if (!voiceItId) {
        throw new Error('VoiceIT user does not exist');
    }

    const request = await provider.getVerificationRequest({
        userId: voiceItId,
        language,
    });
    if (request.biometricType !== BiometricType.VOICE) {
        throw new Error('Unsupported biometric type');
    }

    // construct a request for the user to provide the information provided by the biometrics engine
    const response = new twiml.VoiceResponse();

    response.say(
        getVoiceParams(language),
        __('verification-request', language)
    );

    response.pause({ length: 1 });
    response.say(getVoiceParams(language), request.phrase);
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
                state: VerificationState.AUTHENTICATION_REQUESTED,
                req: request.request,
                sub: user.id,
            }),
        },
        body: response.toString(),
    };
}
