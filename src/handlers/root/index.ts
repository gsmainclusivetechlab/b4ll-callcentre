import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';

export const get = safeHandle(async (request) => {
    const { language, user } = request;

    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('welcome-known', language));

    if (user.isDeactivated) {
        response.say(
            getVoiceParams(language),
            __('reactivation-welcome', language)
        );
        response.redirect({ method: 'GET' }, `./${language}/reactivation`);
    } else {
        response.redirect({ method: 'GET' }, `./${language}/menu`);
    }

    return response;
});
