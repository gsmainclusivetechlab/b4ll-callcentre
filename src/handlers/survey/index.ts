import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('survey-welcome', language));
    response.redirect({ method: 'GET' }, `./survey/question-1`);

    return response;
});
