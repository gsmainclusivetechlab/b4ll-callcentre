import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { getVoiceParams, __, isSupportedLanguage } from './strings';
import { twiml } from 'twilio';

export const safeHandle = (
    f: (e: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
): APIGatewayProxyHandler => (e) =>
    f(e).catch((err) => {
        const maybeLang = e.pathParameters?.lang;
        const language = isSupportedLanguage(maybeLang) ? maybeLang : 'en-GB';
        const response = new twiml.VoiceResponse();
        const message =
            typeof err === 'string'
                ? err
                : typeof err.message === 'string'
                ? err.message
                : '';
        response.say(
            getVoiceParams(language),
            __('error', { message }, language)
        );
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: response.toString(),
        };
    });
