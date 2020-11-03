import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from 'aws-lambda';
import {
    getVoiceParams,
    __,
    isSupportedLanguage,
    SupportedLanguage,
} from './strings';
import { twiml } from 'twilio';
import { getAccountItem, RecordType } from './dynamodb';
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
    console.log('parsing', event);
    const language = event.pathParameters?.lang;
    if (!isSupportedLanguage(language)) {
        throw new Error('Unsupported language');
    }
    const body = qs.parse(event.body || '');
    const callerKey =
        body.Direction === 'outbound-api' ||
        event.queryStringParameters?.Direction === 'outbount-api'
            ? 'Called'
            : 'Caller';
    const Caller = body[callerKey] || event.queryStringParameters?.[callerKey];
    if (typeof Caller !== 'string' || Caller.length < 3) {
        throw new Error('Unable to identify caller');
    }
    const user = await getAccountItem(Caller);

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
    console.log('parse result ', { language, user, event, auth });

    // normalise event path
    if (event.requestContext) {
        event.path = event.requestContext.path;
        (event as any).domainName = event.requestContext.domainName;
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
            return serialise(response, 200);
        } catch (err) {
            const maybeLang = e.pathParameters?.lang;
            const language = isSupportedLanguage(maybeLang)
                ? maybeLang
                : 'en-GB';
            if (typeof err === 'object') {
                return serialise(err, err.statusCode || 500);
            }
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
            return serialise(response, 500);
        }
    };
    safeHandler.orig = f;
    return safeHandler;
};

function serialise(r: unknown, statusCode: number): APIGatewayProxyResult {
    console.log('Returning ', r);
    if (typeof r === 'object' && r !== null) {
        if (r instanceof twiml.VoiceResponse) {
            return {
                statusCode,
                headers: {
                    'Content-Type': 'text/xml',
                },
                body: r.toString(),
            };
        }
    }
    return {
        statusCode,
        headers: {
            'Content-Type': 'text/json',
            'access-control-allow-origin': '*',
        },
        body: JSON.stringify(r),
    };
}
