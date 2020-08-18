import { putItem } from '../../services/dynamodb';
import qs from 'querystring';
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';
import {
    createUser,
    enrolUser,
    AVAILABLE_VOICEPRINTS,
    isLegalPhraseKey,
} from '../../services/voiceit';

export const REQUIRED_ENROLMENTS = 3;

export const get = safeHandle(async ({ language, user }) => {
    const response = new twiml.VoiceResponse();

    // 1. Create a VoiceIT user if necessary
    let voiceItId: string;
    if (user.voiceItId) {
        voiceItId = user.voiceItId;
    } else {
        const voiceItUser = await createUser();
        voiceItId = voiceItUser.userId;
        await putItem({ ...user, voiceItId });
    }

    // TODO: (2. Check which phrase the user wants to enrol for)
    const phraseKey = 'Tomorrow' as const;
    const phrase = AVAILABLE_VOICEPRINTS[language][phraseKey];

    // 3. Collect a voice recording for the phrase
    response.say(getVoiceParams(language), __('enrol-message', language));
    response.pause({ length: 1 });
    response.say(getVoiceParams(language), phrase);
    response.record({
        action: `./enrol/${phraseKey}`,
        method: 'POST',
        finishOnKey: '#',
        playBeep: true,
        maxLength: 5,
    });

    return response;
});

export const post = safeHandle(async ({ language, user, event }) => {
    // 4. Receive the recording, send it to voiceIt and count the enrolment in DDB.
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
        throw new Error('VoiceIT user does not exist');
    }
    const phrase = AVAILABLE_VOICEPRINTS[language][phraseKey];

    // Make VoiceIt enrolment
    const enrolment = await enrolUser(voiceItId, language, {
        phrase: phraseKey,
        recordingUrl: RecordingUrl,
    });
    if (enrolment.responseCode !== 'SUCC') {
        // TODO: nicer error flow
        throw new Error('Enrolment failed');
    }

    // update our database
    const prevEnrolments = user.enrolments || {};
    const enrolmentCount = (prevEnrolments[phraseKey] || 0) + 1;
    await putItem({
        ...user,
        enrolments: {
            ...prevEnrolments,
            [phraseKey]: enrolmentCount,
        },
        isEnrolled: user.isEnrolled || enrolmentCount >= REQUIRED_ENROLMENTS,
    });

    const response = new twiml.VoiceResponse();
    const remaining = REQUIRED_ENROLMENTS - enrolmentCount;
    if (remaining > 0) {
        // repeat to record another enrolment
        response.say(
            getVoiceParams(language),
            __('enrol-confirmation', { remaining }, language)
        );
        response.say(getVoiceParams(language), __('enrol-message', language));
        response.pause({ length: 1 });
        response.say(getVoiceParams(language), phrase);
        response.record({
            method: 'POST',
            finishOnKey: '#',
            playBeep: true,
            maxLength: 5,
        });

        return response;
    }

    // made all enrolments, now return to main menu
    response.say(
        getVoiceParams(language),
        __('enrolment-complete', { phrase }, language)
    );
    response.redirect({ method: 'GET' }, `../menu`);

    return response;
});
