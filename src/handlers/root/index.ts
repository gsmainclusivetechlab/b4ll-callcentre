import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const get = safeHandle(async ({ language }) => {
    // prepare response
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('welcome', language));
    response.redirect({ method: 'GET' }, `./${language}/count`);
    return response;
});
