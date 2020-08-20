import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import {
    getVoiceParams,
    __,
    isSupportedLanguage,
    SupportedLanguage,
} from './strings';
import { twiml } from 'twilio';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import { getItem, RecordType } from './dynamodb';
import qs from 'querystring';

export interface ParsedRequest {
    language: SupportedLanguage;
    user: RecordType;
    event: APIGatewayProxyEvent;
}

async function parseRequest(
    event: APIGatewayProxyEvent
): Promise<ParsedRequest> {
    const language = event.pathParameters?.lang;
    if (!isSupportedLanguage(language)) {
        throw new Error('Unsupported language');
    }
    const body = qs.parse(event.body || '');
    const Caller = body.Caller || event.queryStringParameters?.Caller;
    if (typeof Caller !== 'string' || Caller.length < 3) {
        throw new Error('Unable to identify caller');
    }
    const user = await getItem(Caller);
    return {
        language,
        user,
        event,
    };
}

export const safeHandle = (
    f: (e: ParsedRequest) => Promise<VoiceResponse>
): APIGatewayProxyHandler => {
    const safeHandler = async function safelyHandledFunction(
        e: APIGatewayProxyEvent
    ) {
        try {
            const result = await parseRequest(e);
            const response = await f(result);
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/xml',
                },
                body: response.toString(),
            };
        } catch (err) {
            const maybeLang = e.pathParameters?.lang;
            const language = isSupportedLanguage(maybeLang)
                ? maybeLang
                : 'en-GB';
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
        }
    };
    safeHandler.orig = f;
    return safeHandler;
};
