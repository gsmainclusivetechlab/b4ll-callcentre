import { getItem, putItem } from '../../services/dynamodb';
import { twiml } from 'twilio';
import {
    getVoiceParams,
    __,
    isSupportedLanguage,
} from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const handler = safeHandle(async (e) => {
    // parse input
    const name = e.queryStringParameters?.Caller;
    if (name === undefined || name.length < 3) {
        throw new Error('Unable to identify caller');
    }
    const language = e.pathParameters?.lang;
    if (!isSupportedLanguage(language)) {
        throw new Error('Unsupported language');
    }

    // business logic - get/update DB
    const getResult = await getItem(name);
    const count = (getResult.count || 0) + 1;
    await putItem(name, { count });

    // prepare response
    const response = new twiml.VoiceResponse();
    response.say(
        getVoiceParams(language),
        __('caller-count', { count }, language)
    );
    response.redirect({ method: 'GET' }, `./record`);

    // return answer
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: response.toString(),
    };
});
