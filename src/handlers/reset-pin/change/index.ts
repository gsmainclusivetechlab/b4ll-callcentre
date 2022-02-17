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
            action: `current`,
            numDigits: 4,
            finishOnKey: '#',
        });

        gather.say(voice, __('reset-pin-welcome', language));

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, './change');
        return response;
    },
    { requireVerification: true }
);
