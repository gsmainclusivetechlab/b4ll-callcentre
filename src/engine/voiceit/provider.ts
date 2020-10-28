import {
    BiometricType,
    EnrolmentRequest,
    BiometricsProvider,
} from '../BiometricsProvider';
import {
    createUser,
    getEnrolledPhrases,
    REQUIRED_ENROLMENTS,
    getPhrases,
    enrolUser,
    verifyUser,
} from './api';

interface Params {
    userId: string;
    language: string;
}

declare const voiceItData: unique symbol;

export type VoiceItEnrolmentData = {
    phrase: string;
    recordingsRequired: number;
    userId: string;
} & {
    // prevent manual creation of EnrolmentData, which is not the intended use
    [voiceItData]: true;
};

export type VoiceItVerificationData = {
    phrase: string;
} & {
    // prevent manual creation of VerificationData, which is not the intended use
    [voiceItData]: true;
};

export type VoiceItProvider = BiometricsProvider<
    BiometricType.VOICE,
    VoiceItEnrolmentData,
    Omit<Params, 'userId'> & { userId?: string },
    Params,
    VoiceItVerificationData,
    Params,
    Params
>;

export const provider: VoiceItProvider = {
    getEnrolmentRequest: async ({ userId, language }) => {
        if (!userId) {
            const voiceItUser = await createUser();
            userId = voiceItUser.userId;
        }
        const phraseCounts = await getEnrolledPhrases(userId, language);

        // find whichever phrase has most enrolments (if any)
        const unfinishedPhrase = Object.keys(phraseCounts).reduce(
            (curr, phrase) =>
                curr.count < phraseCounts[phrase]
                    ? { count: phraseCounts[phrase], phrase }
                    : curr,
            { count: 0, phrase: undefined as string | undefined }
        );

        let phrase: string, recordingsRequired: number;
        if (unfinishedPhrase.phrase && unfinishedPhrase.count < 3) {
            phrase = unfinishedPhrase.phrase;
            recordingsRequired = Math.max(
                1,
                REQUIRED_ENROLMENTS - unfinishedPhrase.count
            );
        } else {
            const phrases = await getPhrases(language);
            const availablePhrases = phrases.map((x) => x.text.toLowerCase());
            phrase =
                availablePhrases[
                    Math.floor(Math.random() * availablePhrases.length)
                ];
            recordingsRequired = REQUIRED_ENROLMENTS;
        }
        if (!phrase) throw new Error('No phrases available for enrolment');
        return {
            biometricType: BiometricType.VOICE,
            phrase: phrase,
            request: {
                phrase,
                userId,
                recordingsRequired,
            } as VoiceItEnrolmentData,
        };
    },

    handleEnrolmentResponse: async (response, { userId, language }) => {
        if (response.biometricType !== BiometricType.VOICE) {
            throw new Error('Unexpected biometric type');
        }
        const {
            recordingUrl,
            request: { phrase },
        } = response;
        const dupeRequest: EnrolmentRequest<
            VoiceItEnrolmentData
        >[BiometricType.VOICE] = {
            biometricType: BiometricType.VOICE,
            phrase: response.request.phrase,
            request: response.request,
        };
        try {
            const existingPhrasePromise = getEnrolledPhrases(userId, language);
            const enrolment = await enrolUser(userId, language, {
                phrase,
                recordingUrl,
            });
            if (enrolment.responseCode === 'SUCC') {
                const existingPhrases = await existingPhrasePromise;
                const phraseCount =
                    (existingPhrases[phrase.toLowerCase()] ?? 0) + 1;

                if (phraseCount < REQUIRED_ENROLMENTS) {
                    dupeRequest.request.recordingsRequired -= 1;

                    return {
                        success: true,
                        complete: false,
                        // repeat the request
                        next: dupeRequest,
                    };
                }
                return { success: true, complete: true };
            }
        } catch (e) {
            // ignore errors and simply retry the request
        }
        return {
            success: false,
            complete: false,
            next: dupeRequest,
        };
    },

    getVerificationRequest: async ({ userId, language }) => {
        const enrolments = await getEnrolledPhrases(userId, language);
        const phrases = Object.keys(enrolments).filter(
            (x) => enrolments[x] >= REQUIRED_ENROLMENTS
        );
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        if (!phrase) {
            throw new Error('No phrases available for verification');
        }

        return {
            phrase,
            biometricType: BiometricType.VOICE,
            request: { phrase } as VoiceItVerificationData,
        };
    },

    handleVerificationResponse: async (response, { userId, language }) => {
        if (response.biometricType !== BiometricType.VOICE) {
            throw new Error('Unexpected biometric type');
        }
        const verification = await verifyUser(userId, language, {
            recordingUrl: response.recordingUrl,
            phrase: response.request.phrase,
        });
        const verified = verification.responseCode === 'SUCC';
        return {
            success: verified,
            complete: verified,
            confidence: verification.confidence,
        };
    },
};
