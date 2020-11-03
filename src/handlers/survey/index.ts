import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('survey-welcome', language));

    response.say(getVoiceParams(language), __('survey-question-01', language));
    response.gather({
        input: ['dtmf', 'speech'],
        numDigits: 1,
    });

    response.redirect({ method: 'GET' }, `./${language}/menu`);

    return response;
});
