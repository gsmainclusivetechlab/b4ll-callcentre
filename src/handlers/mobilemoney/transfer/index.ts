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
        method: 'POST',
        language: voice.language,
        speechTimeout: 'auto',
    });
    gatherNode.say(voice, __('transfer-message', language));

    if (request.event.body) {
        response.say(getVoiceParams(language), request.event.body);
    }

    // If the user doesn't enter input, loop
    response.redirect('./transfer');
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
