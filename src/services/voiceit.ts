import VoiceIt2, { VoiceIt } from 'voiceit2-nodejs';
import axios from 'axios';
import { SupportedLanguage } from './strings';

const auth = {
    username: process.env.VOICEIT_API_KEY || '',
    password: process.env.VOICEIT_API_TOKEN || '',
};

const voiceIt = new VoiceIt2(auth.username, auth.password);

export const AVAILABLE_VOICEPRINTS = {
    'en-GB': {
        Tomorrow: 'Never forget tomorrow is a new day',
        Zoo: 'Zoos are filled with small and large animals',
        Telecom: 'please log in to my telecom services account',
    },
    'en-DEV': {
        // These will get mocked anyway so we can use whatever
        Tomorrow: 'Never forget tomorrow is a new day',
        Zoo: 'Zoos are filled with small and large animals',
        Telecom: 'please log in to my telecom services account',
    },
    'fr-FR': {
        Tomorrow: "N'oubliez jamais que demain est un nouveau jour",
        //  TODO: add voiceprints after they are set up in VoiceIt
    },
    'pt-BR': {
        //  TODO: add voiceprints after they are set up in VoiceIt
    },
    'es-ES': {
        //  TODO: add voiceprints after they are set up in VoiceIt
    },
};

export function isLegalPhraseKey<L extends SupportedLanguage>(
    language: L,
    phraseKey: unknown
): phraseKey is keyof typeof AVAILABLE_VOICEPRINTS[L] {
    if (typeof phraseKey !== 'string') return false;
    return phraseKey in AVAILABLE_VOICEPRINTS[language];
}

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

export const enrolUser = async <L extends SupportedLanguage>(
    userId: string,
    language: L,
    enrolment: {
        phrase: keyof typeof AVAILABLE_VOICEPRINTS[L];
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>> => {
    const matches = AVAILABLE_VOICEPRINTS[language] as Record<string, string>;
    const phrase = matches[enrolment.phrase as string];
    console.log('Input', {
        userId,
        phrase,
        audioFileUrl: enrolment.recordingUrl,
        contentLanguage: 'en-US',
        // contentLanguage: language,
    });
    const result = await axios.post(
        'https://api.voiceit.io/enrollments/voice/byUrl',
        {
            userId,
            phrase,
            fileUrl: enrolment.recordingUrl,
            contentLanguage: 'en-US',
            // TODO: Restore language when we've got a full account
            // contentLanguage: language,
        },
        {
            auth,
        }
    );
    console.log(result);
    return result.data;
};

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
                    contentLanguage: 'en-US',
                    // TODO: Restore language when we've got a full account
                    // contentLanguage: language,
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
