import { twiml } from 'twilio';
import { __, getVoiceParams } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    const voice = getVoiceParams(language);

    response.say(voice, __('bill-payment-message', language));

    // If the user doesn't enter input, loop
    response.redirect('../return');
    return response;
});

export const post = safeHandle(
    async () => {
        return new twiml.VoiceResponse();
    },
    {
        requireVerification: false,
    }
);
