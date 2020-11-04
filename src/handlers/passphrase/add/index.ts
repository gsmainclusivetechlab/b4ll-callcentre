import { twiml } from 'twilio';
import { safeHandle } from '../../../services/safeHandle';
import { __, getVoiceParams } from '../../../services/strings';
import { provider } from '../../../engine/voiceit/provider';

// N.B. there is some overlap here with `services/auth/requestEnrolment` but not enough to worry about
export const get = safeHandle(
    async (request) => {
        const { event, user, language } = request;
        const response = new twiml.VoiceResponse();
        const enrolmentReq = await provider.getEnrolmentRequest({
            userId: user.voiceItId,
            language,
        });
        response.redirect({ method: 'GET' }, './add/final');
        response.say(getVoiceParams(language), __('enrol-message', language));
        response.pause({ length: 1 });
        response.say(getVoiceParams(language), enrolmentReq.phrase);
        response.record({
            action: './add/final',
            method: event.httpMethod,
            finishOnKey: '#',
            playBeep: true,
            maxLength: 5,
        });
        return {
            body: response,
            // need to store the original enrolment request so that the receiver can use it
            cookie: {
                enrolmentRequest: JSON.stringify(enrolmentReq.request),
            },
        };
    },
    {
        requireVerification: true,
        allowEnrolment: false,
    }
);
