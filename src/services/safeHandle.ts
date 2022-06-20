/**
===================================================================================================================
                                                SafeHandle
                                        Parses all requests to handlers.

 * parseRequest: Identifies Caller, sets Auth cookie
 * safeHandle: Invokes parseRequest, checks if verification needed, sends to serialise
 
===================================================================================================================
*/
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from 'aws-lambda';
import {
    __,
    getVoiceParams,
    isSupportedLanguage,
    SupportedLanguage,
} from './strings';
import { twiml } from 'twilio';
import { getAccountItem, RecordType } from './dynamodb';
import qs from 'querystring';
import * as jwt from 'jsonwebtoken';
import {
    AuthCookie,
    HandlerParams,
    handleVerification,
    VerificationState,
} from './auth';

export class BaseError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);

        Object.setPrototypeOf(this, new.target.prototype);
        this.name = Error.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this);
    }
}

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
        event.queryStringParameters?.Direction === 'outbound-api'
            ? 'Called'
            : 'Caller';
    const Caller =
        body[callerKey] ||
        event.queryStringParameters?.[callerKey] ||
        body['From'] ||
        event.queryStringParameters?.['From'];
    console.log('Caller - ', Caller);
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

    // normalise event path
    if (event.requestContext) {
        event.path = event.requestContext.path;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event as any).domainName = event.requestContext.domainName;
    }

    return {
        language,
        user,
        event,
        auth,
    };
}

interface Returnable {
    toString: () => string;
}
export const safeHandle = (
    f: (
        e: ParsedRequest
    ) => Promise<
        Returnable | { body: Returnable; cookie?: Record<string, string> }
    >,
    params: HandlerParams = {}
): APIGatewayProxyHandler => {
    const safeHandler = async function safelyHandledFunction(
        e: APIGatewayProxyEvent
    ) {
        try {
            console.log('trying...');
            const request = await parseRequest(e);
            if (params.requireVerification) {
                const result = await handleVerification(request, params);
                if (result) return result;
            }

            const response = await f(request);
            if ('body' in response) {
                return serialise(response.body, 200, response.cookie);
            }
            return serialise(response, 200);
        } catch (err) {
            console.log('err-> ', err);
            const maybeLang = e.pathParameters?.lang;
            const language = isSupportedLanguage(maybeLang)
                ? maybeLang
                : 'en-GB';
            if (err instanceof BaseError) {
                return serialise(err, err?.statusCode || 500);
            }
            const response = new twiml.VoiceResponse();
            const message = err instanceof BaseError ? err.message : '';
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

function serialise(
    r: unknown,
    statusCode: number,
    cookies?: Record<string, string>
): APIGatewayProxyResult {
    if (typeof r === 'object' && r !== null) {
        if (
            r instanceof twiml.VoiceResponse ||
            r instanceof twiml.MessagingResponse
        ) {
            return {
                statusCode,
                headers: {
                    'Content-Type': 'text/xml',
                },
                ...(cookies
                    ? {
                          multiValueHeaders: {
                              'Set-Cookie': Object.entries(cookies).map(
                                  ([name, value]) => `${name}=${value}`
                              ),
                          },
                      }
                    : {}),
                body: r.toString(),
            };
        }
        if (r instanceof twiml.MessagingResponse) {
            return {
                statusCode,
                headers: {
                    'Content-Type': 'text/xml',
                },
                ...(cookies
                    ? {
                          multiValueHeaders: {
                              'Set-Cookie': Object.entries(cookies).map(
                                  ([name, value]) => `${name}=${value}`
                              ),
                          },
                      }
                    : {}),
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
