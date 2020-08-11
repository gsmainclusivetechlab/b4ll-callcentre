import VoiceIt2, { VoiceIt } from 'voiceit2-nodejs';
import { SupportedLanguage } from './strings';

const voiceIt = new VoiceIt2(
    process.env.VOICEIT_API_KEY || '',
    process.env.VOICEIT_API_TOKEN || ''
);

export const AVAILABLE_VOICEPRINTS = {
    'en-GB': {
        Tomorrow: 'Never forget tomorrow is a new day',
        Zoo: 'Zoos are filled with small and large animals',
        Telecom: 'please log in to my telecom services account',
    },
    'fr-FR': {
        //  TODO: add voiceprints after they are set up in VoiceIt
    },
};

export function createUser(): Promise<VoiceIt.Response<VoiceIt.User>> {
    return new Promise((resolve, reject) => {
        try {
            voiceIt.createUser((x) => {
                if (x.responseCode === 'SUCC') {
                    return resolve(x);
                }
                return reject(x);
            });
        } catch (e) {
            reject(e);
        }
    });
}

export const enrolUser = <L extends SupportedLanguage>(
    userId: string,
    language: L,
    enrolment: {
        phrase: keyof typeof AVAILABLE_VOICEPRINTS[L];
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>> =>
    new Promise((resolve, reject) => {
        try {
            const matches = AVAILABLE_VOICEPRINTS[language] as Record<
                string,
                string
            >;
            const phrase = matches[enrolment.phrase as string];
            voiceIt.createVoiceEnrolmentByUrl(
                {
                    userId,
                    phrase,
                    audioFileUrl: enrolment.recordingUrl,
                    contentLanguage: language,
                },
                (x) => {
                    if (x.responseCode === 'SUCC') {
                        return resolve(x);
                    }
                    return reject(x);
                }
            );
        } catch (e) {
            reject(e);
        }
    });

export const verifyUser = <L extends SupportedLanguage>(
    userId: string,
    language: L,
    enrolment: {
        phrase: keyof typeof AVAILABLE_VOICEPRINTS[L];
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<{ confidence: number }>> =>
    new Promise((resolve, reject) => {
        try {
            const matches = AVAILABLE_VOICEPRINTS[language] as Record<
                string,
                string
            >;
            const phrase = matches[enrolment.phrase as string];
            voiceIt.voiceVerificationByUrl(
                {
                    userId,
                    phrase,
                    audioFileUrl: enrolment.recordingUrl,
                    contentLanguage: language,
                },
                (x) => {
                    if (x.responseCode === 'SUCC') {
                        return resolve(x);
                    }
                    return reject(x);
                }
            );
        } catch (e) {
            reject(e);
        }
    });
