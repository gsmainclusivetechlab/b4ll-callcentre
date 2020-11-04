import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import querystring from 'querystring';
import { putSurveyItem, RecordType } from '../../../services/dynamodb';

export const post = safeHandle(async (request) => {
    const { language } = request;
    const { Digits, AccountSid, Caller } = querystring.parse(
        request.event.body || ''
    );
    const id = AccountSid.slice(4) as string;
    const countryCode = Caller.slice(0, 3) as string;
    const answer = Digits || null;
    const response = new twiml.VoiceResponse();

    console.log(id);

    if (answer && id) {
        const survey: RecordType = {
            id: id,
            questionOne: +Digits,
            countryCode: countryCode,
        };
        await putSurveyItem(survey);
        response.say(
            getVoiceParams(language),
            __('survey-question-02', language)
        );
        response.gather({
            input: ['dtmf', 'speech'],
            action: 'final',
            numDigits: 1,
        });
    } else {
        response.say(getVoiceParams(language), __('error', language));
        response.redirect({ method: 'GET' }, `/${language}/menu`);
    }
    return response;
});
