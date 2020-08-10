import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';
import querystring from 'querystring';

const recordOptions = ['record', 'sign up', 'enrol', 'one', '1'];
const listenOptions = ['hear', 'listen', 'two', '2'];
export const post = safeHandle(async ({ language, user, event }) => {
    const response = new twiml.VoiceResponse();
    const { Digits, SpeechResult } = querystring.parse(event.body || '');
    const answer = Digits || SpeechResult || null;
    if (typeof answer === 'string') {
        if (recordOptions.indexOf(answer) >= 0) {
            response.redirect({ method: 'GET' }, `./${language}/record`);
            return response;
        } else if (listenOptions.indexOf(answer) >= 0) {
            if (user.recordingUrl) {
                response.play(user.recordingUrl);
            }
            response.redirect({ method: 'GET' }, `./${language}/count`);
            return response;
        }
    }

    response.say(getVoiceParams(language), __('did-not-understand', language));
    // redirect to root and we can try again
    response.redirect({ method: 'GET' }, `./${language}`);
    return response;
});

export const get = safeHandle(async ({ language, user }) => {
    const response = new twiml.VoiceResponse();
    const gather = response.gather({
        input: ['dtmf', 'speech'],
        method: 'POST',
        language,
        hints: recordOptions.concat(listenOptions).join(','),
        speechTimeout: 'auto',
        numDigits: 1,
        timeout: 5,
        speechModel: 'default',
    });
    if (user && user.recordingUrl) {
        gather.say(getVoiceParams(language), __('welcome-known', language));
    } else {
        gather.say(getVoiceParams(language), __('welcome-stranger', language));
    }

    // if the gather doesn't detect anything, we fall back on this next instruction:
    response.redirect({ method: 'GET' }, `./${language}/count`);
    return response;
});
