import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import {
    getVoiceParams,
    __,
    isSupportedLanguage,
    SupportedLanguage,
} from './strings';
import { twiml } from 'twilio';
import { getItem, RecordType } from './dynamodb';
import qs from 'querystring';
import * as jwt from 'jsonwebtoken';
import {
    HandlerParams,
    handleVerification,
    AuthCookie,
    VerificationState,
} from './auth';

export interface ParsedRequest {
    language: SupportedLanguage;
    user: RecordType;
    event: APIGatewayProxyEvent;
    auth: AuthCookie;
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

    // By default, the user is unauthenticated
    let auth: AuthCookie = {
        sub: Caller,
        state: user.isEnrolled
            ? VerificationState.REGISTERED
            : VerificationState.NOT_ENROLLED,
    };
    const cookie = event.headers.Cookie?.split(/;\s?/)
        ?.map((x) => x.split('='))
        ?.find(([name]) => name === 'Auth')?.[1];
    if (cookie) {
        try {
            if (!process.env.JWT_KEY)
                throw new Error('No JWT Key found in environment');
            auth = jwt.verify(cookie, process.env.JWT_KEY, {
                subject: Caller,
            }) as AuthCookie;
        } catch (e) {
            console.log(e);
            // ignore the failure and treat this as an unauthorized user
        }
    }
    return {
        language,
        user,
        event,
        auth,
    };
}

export const safeHandle = (
    f: (e: ParsedRequest) => Promise<{ toString: () => string }>,
    params: HandlerParams = {}
): APIGatewayProxyHandler => {
    const safeHandler = async function safelyHandledFunction(
        e: APIGatewayProxyEvent
    ) {
        try {
            const request = await parseRequest(e);
            if (params.requireVerification) {
                const result = await handleVerification(request, params);
                if (result) return result;
            }

            const response = await f(request);
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
