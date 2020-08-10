import { putItem } from '../../services/dynamodb';
import qs from 'querystring';
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const get = safeHandle(async ({ language }) => {
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('recording-request', language));
    response.record({
        // default action is to submit to same URL as current request
        method: 'POST',
        finishOnKey: '#',
        playBeep: true,
        trim: 'trim-silence',
        maxLength: 5,
    });

    return response;
});

export const post = safeHandle(async ({ language, user, event }) => {
    const response = new twiml.VoiceResponse();

    const body = qs.parse(event.body || '');
    const { RecordingUrl } = body;

    // receiving RecordingUrl
    if (typeof RecordingUrl !== 'string') {
        throw new Error('Could not retrieve recording URL.');
    }
    await putItem({ ...user, recordingUrl: RecordingUrl });
    response.say(
        getVoiceParams(language),
        __('recording-confirmation', language)
    );
    response.play(RecordingUrl);

    response.redirect({ method: 'GET' }, `./count`);

    return response;
});
