/**
===================================================================================================================
                                                Pay a bill Handler

 * GET = asks caller for account number, redirects to /account-number
 
===================================================================================================================
*/
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
            action: `pay-bill/account-number`,
        });

        gather.say(voice, __('bill-payment-message', language));

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, './pay-bill');
        return response;
    },
    { requireVerification: true }
);
