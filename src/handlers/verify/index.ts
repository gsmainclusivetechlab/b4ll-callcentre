import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';
import { verifyUser, LegalVoicePrint } from '../../services/voiceit';
import {
    AVAILABLE_VOICEPRINTS,
    isLegalPhraseKey,
} from '../../services/voiceit';
import qs from 'querystring';
import { REQUIRED_ENROLMENTS } from '../enrol';

export const get = safeHandle(async ({ language, user }) => {
    if (!user.isEnrolled) {
        throw new Error(
            'You must be enrolled before signing in. ' + JSON.stringify(user)
        );
    }
    const { enrolments = {} } = user;
    const phraseKeys = Object.keys(enrolments).filter(
        (phraseKey): phraseKey is LegalVoicePrint<typeof language> =>
            enrolments[phraseKey] >= REQUIRED_ENROLMENTS &&
            isLegalPhraseKey(language, phraseKey)
    );
    const phraseKey = phraseKeys[Math.floor(Math.random() * phraseKeys.length)];
    if (!phraseKey) {
        throw new Error('No valid phrases found');
    }
    const phrase = AVAILABLE_VOICEPRINTS[language][phraseKey];

    const response = new twiml.VoiceResponse();
    response.say(
        getVoiceParams(language),
        __('verification-request', language)
    );
    response.pause({ length: 0.5 });
    response.say(getVoiceParams(language), phrase);
    response.record({
        action: `./verify/${phraseKey}`,
        method: 'POST',
        finishOnKey: '#',
        playBeep: true,
        maxLength: 5,
    });

    return response;
});

export const post = safeHandle(async ({ language, user, event }) => {
    const phraseKey = event.pathParameters?.phraseKey;
    const body = qs.parse(event.body || '');
    const { RecordingUrl } = body;
    const { voiceItId } = user;
    if (!isLegalPhraseKey(language, phraseKey)) {
        throw new Error('Unrecognised phrase key');
    }
    if (typeof RecordingUrl !== 'string') {
        throw new Error('Could not retrieve recording URL.');
    }
    if (!voiceItId) {
        throw new Error('Voice IT user does not exist');
    }

    const verification = await verifyUser(voiceItId, language, {
        phrase: phraseKey,
        recordingUrl: RecordingUrl,
    });

    if (verification.responseCode === 'SUCC') {
        // successfully authenticated
        const response = new twiml.VoiceResponse();
        response.say(
            getVoiceParams(language),
            __('verification-confirmation', language)
        );
        response.redirect({ method: 'GET' }, '../menu');
        return response;
    }
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('verification-failed', language));
    response.redirect({ method: 'GET' }, `../verify`);
    return response;
});
