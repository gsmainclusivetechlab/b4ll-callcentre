import { twiml } from 'twilio';
import {
    getVoiceParams,
    __,
    isSupportedLanguage,
} from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const handler = safeHandle(async (e) => {
    // parse input
    const language = e.pathParameters?.lang;
    if (!isSupportedLanguage(language)) {
        throw new Error('Unsupported language');
    }

    // prepare response
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('welcome', language));
    response.redirect({ method: 'GET' }, `./${language}/count`);

    // return answer
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: response.toString(),
    };
});
