import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(async (request) => {
    const { language, event } = request;
    const questionNumber = event.pathParameters?.questionNumber;

    const response = new twiml.VoiceResponse();

    switch (questionNumber) {
        case '1':
            response.say(
                getVoiceParams(language),
                __('survey-question-01', language)
            );
            break;
        case '2':
            response.say(
                getVoiceParams(language),
                __('survey-question-02', language)
            );
            break;
        default:
            response.say(
                getVoiceParams(language),
                __('survey-finish', language)
            );
            response.hangup();
            return response;
    }
    response.gather({
        input: ['dtmf', 'speech'],
        action: `${questionNumber}/final`,
        numDigits: 1,
    });

    return response;
});