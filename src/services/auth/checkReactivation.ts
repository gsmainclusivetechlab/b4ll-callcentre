import { getVoiceParams, __ } from '../strings';
import { twiml } from 'twilio';
import qs from 'querystring';
import { ParsedRequest } from '../safeHandle';
import { APIGatewayProxyResult } from 'aws-lambda';
import { BiometricType } from '../../engine/BiometricsProvider';
import { provider } from '../../engine/voiceit/provider';
import { VerificationState, makeCookieHeader } from '.';
import { putItem } from '../dynamodb';

export const checkReactivation = async (
    { language, user, event, auth }: ParsedRequest,
    redirect?: { method: string; target: string }
): Promise<APIGatewayProxyResult> => {
    if (auth.state !== VerificationState.REACTIVATION_REQUESTED) {
        throw new Error('Unexpected verification state');
    }
    const body = qs.parse(event.body || '');
    const { RecordingUrl = event.queryStringParameters?.RecordingUrl } = body;
    const { voiceItId } = user;
    if (typeof RecordingUrl !== 'string') {
        throw new Error('Could not retrieve recording URL.');
    }
    if (!voiceItId) {
        throw new Error('VoiceIT user does not exist');
    }

    const {
        complete,
        success,
        confidence,
    } = await provider.handleVerificationResponse(
        {
            biometricType: BiometricType.VOICE,
            recordingUrl: RecordingUrl,
            request: auth.req,
        },
        { userId: voiceItId, language }
    );
    if (complete !== success) {
        throw new Error(
            'Verification flow does not currently support multi-step verification'
        );
    }

    // TODO: flow for when next is defined - probably extract response construction from `requestVerification`
    const response = new twiml.VoiceResponse();

    // Statement to define if the verification is a normal login or an account reactivation

    response.say(
        getVoiceParams(language),
        complete
            ? __(
                  'reactivation-message',
                  { confidence: Math.round(confidence) },
                  language
              )
            : __('verification-failed', language)
    );
    await putItem({
        ...user,
        isDeactivated: false,
    });

    // send the user to the resource they originally tried to access
    response.redirect(
        { method: redirect?.method || event.httpMethod },
        redirect?.target || event.path
    );

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
            ...makeCookieHeader({
                state: complete
                    ? VerificationState.AUTHENTICATED
                    : // request will get blocked again so user can retry
                      VerificationState.REGISTERED,
                sub: user.id,
            }),
        },
        body: response.toString(),
    };
};
