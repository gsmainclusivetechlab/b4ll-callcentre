import {
    APIGatewayProxyHandlerV2,
    APIGatewayProxyEventV2,
    APIGatewayProxyStructuredResultV2,
} from 'aws-lambda';
import { getVoiceParams, __, isSupportedLanguage } from './strings';
import { twiml } from 'twilio';

export const safeHandle = (
    f: (e: APIGatewayProxyEventV2) => Promise<APIGatewayProxyStructuredResultV2>
): APIGatewayProxyHandlerV2 => (e) =>
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
