import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();
        const voice = getVoiceParams(language);

        const gather = response.gather({
            input: ['dtmf'],
            numDigits: 6,
            action: `transfer/account-number`,
        });

        gather.say(voice, __('transfer-message', language));

        // If the user doesn't enter input, loop
        response.redirect('../return');
        return response;
    },
    { requireVerification: true }
);
