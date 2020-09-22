import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    const voice = getVoiceParams(language);

    const gatherNode = response.gather({
        numDigits: 7,
        method: 'POST',
    });
    gatherNode.say(voice, 'bill-payment-message');

    // If the user doesn't enter input, loop
    response.redirect('./pay-bill');
    return response;
});
