import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import approvedCallers from '../../numbers.json';

export const get = safeHandle(async (request) => {
    const { language, user } = request;

    const response = new twiml.VoiceResponse();

    if (approvedCallers.indexOf(user.id) < 0) {
        response.say(
            getVoiceParams(language),
            __('unapproved-caller', language)
        );
        response.hangup();
        return response;
    }

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
