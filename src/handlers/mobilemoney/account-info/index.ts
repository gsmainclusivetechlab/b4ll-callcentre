import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(async ({ language }) => {
    const balance = '$100.00';

    const response = new twiml.VoiceResponse();
    response.say(
        getVoiceParams(language),
        __('mobile-money-info', { balance }, language)
    );

    response.redirect({ method: 'GET' }, `../return`);
    return response;
});
