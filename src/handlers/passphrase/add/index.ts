import { twiml } from 'twilio';
import { safeHandle } from '../../../services/safeHandle';
import { __, getVoiceParams } from '../../../services/strings';
import { provider } from '../../../engine/voiceit/provider';
import { putItem } from '../../../services/dynamodb';

// N.B. there is some overlap here with `services/auth/requestEnrolment` but not enough to worry about
export const get = safeHandle(
    async (request) => {
        const { event, user, language } = request;
        const response = new twiml.VoiceResponse();
        const enrolmentReq = await provider.getEnrolmentRequest({
            userId: user.voiceItId,
            language,
        });
        await putItem({
            ...user,
            enrolmentRequest: enrolmentReq,
        });
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
        };
    },
    {
        requireVerification: false,
        allowEnrolment: false,
    }
);
