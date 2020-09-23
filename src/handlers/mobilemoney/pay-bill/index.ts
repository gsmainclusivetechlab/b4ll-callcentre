import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import { inputValidation } from '../../../services/menu';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    const voice = getVoiceParams(language);

    const gatherNode = response.gather({
        numDigits: 6,
        input: ['dtmf'],
    });

    if (request.event.body) {
        response.say(getVoiceParams(language), request.event.body);
    }

    gatherNode.say(voice, __('bill-payment-message', language));

    // If the user doesn't enter input, loop
    response.redirect('./pay-bill');
    return response;
});

export const post = safeHandle(
    async (request) => {
        return inputValidation(request, `../return`);
    },
    {
        requireVerification: false,
    }
);
