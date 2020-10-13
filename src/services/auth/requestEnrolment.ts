import { getVoiceParams, __ } from '../strings';
import { twiml } from 'twilio';
import { ParsedRequest } from '../safeHandle';
import { APIGatewayProxyResult } from 'aws-lambda';
import { BiometricType } from '../../engine/BiometricsProvider';
import { provider } from '../../engine/voiceit/provider';
import { putItem } from '../dynamodb';
import { makeCookieHeader, VerificationState } from '.';

export async function requestEnrolment(
    input: ParsedRequest
): Promise<APIGatewayProxyResult> {
    const { language, event } = input;
    let { user } = input;
    const response = new twiml.VoiceResponse();

    const enrolmentReq = await provider.getEnrolmentRequest({
        userId: user.voiceItId,
        language,
    });
    if (enrolmentReq.biometricType !== BiometricType.VOICE) {
        throw new Error('Cannot handle biometrics which are not voice');
    }
    // save the voiceIT user id so we can retry if it fails first time
    if (!user.voiceItId) {
        user = {
            ...user,
            voiceItId: enrolmentReq.request.userId,
            balanceAmount: '100',
        };
        await putItem(user);
    }

    const { phrase } = enrolmentReq;
    response.say(getVoiceParams(language), __('welcome-stranger', language));
    response.say(getVoiceParams(language), __('enrol-message', language));
    response.pause({ length: 1 });
    response.say(getVoiceParams(language), enrolmentReq.phrase);
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
                phrase,
                req: enrolmentReq.request,
                sub: user.id,
            }),
        },
        body: response.toString(),
    };
}
