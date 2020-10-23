import { APIGatewayProxyResult } from 'aws-lambda';
import { getVoiceParams, __ } from '../strings';
import { twiml } from 'twilio';
import { requestVerification } from './requestVerification';
import { checkVerification } from './checkVerification';
import { handleEnrolment } from './handleEnrolment';
import { requestEnrolment } from './requestEnrolment';
import { ParsedRequest } from '../safeHandle';
import * as jwt from 'jsonwebtoken';
import {
    VoiceItEnrolmentData,
    VoiceItVerificationData,
} from '../../engine/voiceit/provider';

export enum VerificationState {
    NOT_ENROLLED = 0,
    ENROLMENT_REQUESTED = 1,
    REGISTERED = 2,
    AUTHENTICATION_REQUESTED = 3,
    AUTHENTICATED = 4,
    DEACTIVATED = 5,
}
interface BaseCookie {
    /** caller phone number */
    sub: string;
    exp?: number;
}
interface PlainCookie extends BaseCookie {
    state:
        | VerificationState.AUTHENTICATED
        | VerificationState.NOT_ENROLLED
        | VerificationState.REGISTERED
        | VerificationState.DEACTIVATED;
}
interface EnrolmentRequestedCookie extends BaseCookie {
    state: VerificationState.ENROLMENT_REQUESTED;
    /** phrase that the user was asked to record */
    phrase: string;
    req: VoiceItEnrolmentData;
}
interface AuthenticationRequestedCookie extends BaseCookie {
    state: VerificationState.AUTHENTICATION_REQUESTED;
    req: VoiceItVerificationData;
}

export type AuthCookie =
    | PlainCookie
    | AuthenticationRequestedCookie
    | EnrolmentRequestedCookie;

export function makeCookieHeader(cookie: AuthCookie): Record<string, string> {
    const signed = jwt.sign(cookie, process.env.JWT_KEY || '', {
        expiresIn: '30s',
    });
    return {
        'Set-Cookie': `Auth=${signed}`,
    };
}

export interface HandlerParams {
    requireVerification?: boolean;
    allowEnrolment?: boolean;
    allowDeactivated?: boolean;
    loginRedirect?: { method: string; target: string };
}

export async function handleVerification(
    request: ParsedRequest,
    params: HandlerParams
): Promise<null | APIGatewayProxyResult> {
    const { auth, language } = request;
    console.log('Verifying, user is in state ', auth);
    switch (auth?.state) {
        default:
        case VerificationState.NOT_ENROLLED:
            if (params.allowEnrolment === false) break;
            return requestEnrolment(request);
        case VerificationState.ENROLMENT_REQUESTED:
            return handleEnrolment(request, params.loginRedirect);
        case VerificationState.REGISTERED:
            return requestVerification(request);
        case VerificationState.AUTHENTICATION_REQUESTED:
            return checkVerification(request, params.loginRedirect);
        case VerificationState.AUTHENTICATED:
            return null;
        case VerificationState.DEACTIVATED:
            if (params.allowDeactivated === true) return null; // proceed to the original function handler
            break; // proceed to the unauthorised handler below
    }

    // currently the only way to arrive here is if enrolment is required but not allowed on the handler
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('unauthorised', language));
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: response.toString(),
    };
}
