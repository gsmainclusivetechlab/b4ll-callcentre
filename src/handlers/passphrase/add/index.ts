import { twiml } from 'twilio';
import { safeHandle_test } from '../../../services/safeHandle';
import { makeCookieHeader, VerificationState } from '../../../services/auth';
import { __, getVoiceParams } from '../../../services/strings';
import { provider } from '../../../engine/voiceit/provider';

export const get = safeHandle_test(async (request) => {
    const { event, user, language } = request;
    const response = new twiml.VoiceResponse();
    const enrolmentReq = await provider.getEnrolmentRequest({
        userId: user.voiceItId,
        language,
    });
    response.redirect({ method: 'GET' }, './add/final');
    const phrase = enrolmentReq.phrase.toString();
    response.say(getVoiceParams(language), __('enrol-message', language));
    response.pause({ length: 1 });
    response.say(getVoiceParams(language), enrolmentReq.phrase);
    response.record({
        // send the recording to the same URL. The cookie we set will ensure the correct handler picks it up
        action: './add/final',
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
});
