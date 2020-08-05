import { putItem } from '../../services/dynamodb';
import qs from 'querystring';
import { twiml } from 'twilio';
import {
    getVoiceParams,
    __,
    isSupportedLanguage,
} from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const handler = safeHandle(async (e) => {
    // parse input
    const body = qs.parse(e.body || '');
    const { Caller, RecordingUrl } = body;
    const name = Caller || e.queryStringParameters?.Caller;
    if (typeof name !== 'string' || name.length < 3) {
        throw new Error('Unable to identify caller');
    }
    const language = e.pathParameters?.lang;
    if (!isSupportedLanguage(language)) {
        throw new Error('Unsupported language');
    }

    const response = new twiml.VoiceResponse();

    switch (e.requestContext.http.method.toUpperCase()) {
        case 'GET':
            response.say(
                getVoiceParams(language),
                __('recording-request', language)
            );
            response.record({
                // uses same URL by default
                method: 'POST',
            });

            break;
        case 'POST':
            // receiving RecordingUrl
            if (typeof RecordingUrl !== 'string') {
                throw new Error('Could not retrieve recording URL.');
            }
            await putItem(name, { recordingUrl: RecordingUrl });
            response.say(
                getVoiceParams(language),
                __('recording-confirmation', language)
            );
            response.play(RecordingUrl);
            break;
    }

    // return answer
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/xml',
        },
        body: response.toString(),
    };
});
