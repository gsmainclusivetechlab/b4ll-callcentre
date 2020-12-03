import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import {
    getSurveyItem,
    putSurveyItem,
    SurveyResponseType,
} from '../../../../services/dynamodb';
import querystring from 'querystring';

export const post = safeHandle(async (request) => {
    const { language, event } = request;
    const { Digits, CallerCountry, Caller } = querystring.parse(
        request.event.body || ''
    );
    const questionNumber = event.pathParameters?.questionNumber;

    const response = new twiml.VoiceResponse();

    if (+Digits >= 1 && +Digits <= 5) {
        switch (questionNumber) {
            case '1': {
                const initialSurvey: SurveyResponseType = {
                    id: Caller as string,
                    questions: [+Digits],
                    countryCode: CallerCountry as string,
                };
                await putSurveyItem(initialSurvey);
                response.redirect({ method: 'GET' }, `../2`);
                return response;
            }
            case '2': {
                const survey = await getSurveyItem(Caller as string);
                if (survey.questions) {
                    await putSurveyItem({
                        ...survey,
                        questions: [survey.questions[0], +Digits],
                    });
                } else {
                    throw new Error('first survey answer not registered');
                }
                break;
            }
        }
    } else {
        response.say(getVoiceParams(language), __('survey-invalid', language));
        response.redirect({ method: 'GET' }, `../${questionNumber}`);
        return response;
    }
    response.say(getVoiceParams(language), __('survey-finish', language));
    response.hangup();
    return response;
});
