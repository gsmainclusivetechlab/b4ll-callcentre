import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import { menuToHandler } from '../../../services/menu';
import querystring from 'querystring';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    const voice = getVoiceParams(language);

    const gatherNode = response.gather({
        numDigits: 5,
        method: 'POST',
        input: ['dtmf', 'speech'],
        language: voice.language,
        speechTimeout: 'auto',
    });
    gatherNode.say(voice, __('bill-payment-message', language));

    // If the user doesn't enter input, loop
    response.redirect('./pay-bill');
    return response;
});

export const post = safeHandle(
    async (request) => {
        const { language } = request;
        const response = new twiml.VoiceResponse();
        const { Digits, SpeechResult } = querystring.parse(
            request.event.body || ''
        );
        const answer = Digits || SpeechResult || null;

        if (typeof answer == 'string') {
            response.say(
                getVoiceParams(language),
                __('bill-payment-number', { answer }, language)
            );
        }

        response.redirect({ method: 'GET' }, `../mobilemoney`);
        return response;
    },
    {
        requireVerification: false,
    }
);
