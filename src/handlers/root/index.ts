import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const get = safeHandle(async (request) => {
    const { language, user } = request;

    const response = new twiml.VoiceResponse();
    if (user.isEnrolled) {
        response.say(getVoiceParams(language), __('welcome-known', language));
        response.redirect({ method: 'GET' }, `./${language}/verify`);
    } else {
        response.say(
            getVoiceParams(language),
            __('welcome-stranger', language)
        );
        response.redirect({ method: 'GET' }, `./${language}/enrol`);
    }

    return response;
});
