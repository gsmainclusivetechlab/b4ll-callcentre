import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import querystring from 'querystring';
import { getSurveyItem, putSurveyItem } from '../../../services/dynamodb';

export const post = safeHandle(async (request) => {
    const { language } = request;
    const { Digits, AccountSid } = querystring.parse(request.event.body || '');
    const id = AccountSid.slice(4) as string;
    const answer = Digits || null;
    const response = new twiml.VoiceResponse();

    if (answer) {
        const survey = await getSurveyItem(id);
        await putSurveyItem({
            ...survey,
            questionTwo: +Digits,
        });

        response.say(getVoiceParams(language), __('survey-finish', language));
        response.redirect({ method: 'GET' }, `/${language}/return`);
    } else {
        response.say(getVoiceParams(language), __('error', language));
        response.redirect({ method: 'GET' }, `/${language}/return`);
    }
    return response;
});
