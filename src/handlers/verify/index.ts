import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';
import { verifyUser } from '../../services/voiceit';
//import { AVAILABLE_VOICEPRINTS } from '../../services/voiceit';
import qs from 'querystring';

export const get = safeHandle(async ({ language }) => {
    const response = new twiml.VoiceResponse();
    //const passphrase = AVAILABLE_VOICEPRINTS[language];
    // Create a random function to get one of the passphrases
    //const rand = Math.floor(Math.random() * Object.keys(passphrases).length);
    //const randPassphrase = passphrases[Object.keys(passphrases)[rand]];

    response.say(
        getVoiceParams(language),
        __('verification-request', language)
    );
    response.say(
        getVoiceParams(language),
        'Never forget tomorrow is a new day'
    );
    response.record({
        method: 'POST',
        finishOnKey: '#', // Check later if we can do this without the # at the end
        playBeep: true,
        trim: 'trim-silence',
        maxLength: 5,
    });

    return response;
});

export const post = safeHandle(async ({ language, user, event }) => {
    const response = new twiml.VoiceResponse();
    //const phrase = AVAILABLE_VOICEPRINTS['en-GB'].Tomorrow; //Change it to receive the randomic one
    const body = qs.parse(event.body || '');
    const { RecordingUrl } = body;

    // receiving RecordingUrl
    if (typeof RecordingUrl !== 'string') {
        throw new Error('Could not retrieve recording URL.');
    }

    if (language == 'en-GB') {
        const verification = {
            phrase: 'Tomorrow' as const,
            recordingUrl: RecordingUrl,
        };
        if (verifyUser(user.id, language, verification)) {
            response.say(
                getVoiceParams(language),
                __('verification-confirmation', language)
            );
        }
    }

    response.redirect({ method: 'GET' }, `../verify`);
    return response;
});
