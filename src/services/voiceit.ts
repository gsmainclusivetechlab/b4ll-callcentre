import { VoiceIt } from 'voiceit2-nodejs';
import axios from 'axios';
import { SupportedLanguage } from './strings';

const auth = {
    username: process.env.VOICEIT_API_KEY || '',
    password: process.env.VOICEIT_API_TOKEN || '',
};
const api = axios.create({
    baseURL: 'https://api.voiceit.io/',
    auth,
});

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
};

export type LegalVoicePrint<
    L extends SupportedLanguage
> = keyof typeof AVAILABLE_VOICEPRINTS[L];

export function isLegalPhraseKey<L extends SupportedLanguage>(
    language: L,
    phraseKey: unknown
): phraseKey is LegalVoicePrint<L> {
    if (typeof phraseKey !== 'string') return false;
    return phraseKey in AVAILABLE_VOICEPRINTS[language];
}

export async function createUser(): Promise<VoiceIt.Response<VoiceIt.User>> {
    const result = await api.post('/users');
    return result.data;
}

export async function enrolUser<L extends SupportedLanguage>(
    userId: string,
    language: L,
    enrolment: {
        phrase: keyof typeof AVAILABLE_VOICEPRINTS[L];
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>> {
    const matches = AVAILABLE_VOICEPRINTS[language] as Record<string, string>;
    const phrase = matches[enrolment.phrase as string];
    const result = await api.post('/enrollments/voice/byUrl', {
        userId,
        phrase,
        fileUrl: enrolment.recordingUrl,
        contentLanguage: 'en-US',
        // TODO: Restore language when we've got a full account
        // contentLanguage: language,
    });
    return result.data;
}

export async function verifyUser<L extends SupportedLanguage>(
    userId: string,
    language: L,
    enrolment: {
        phrase: keyof typeof AVAILABLE_VOICEPRINTS[L];
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<{ confidence: number }>> {
    const matches = AVAILABLE_VOICEPRINTS[language] as Record<string, string>;
    const phrase = matches[enrolment.phrase as string];
    const result = await api.post('/verification/voice/byUrl', {
        userId,
        phrase,
        fileUrl: enrolment.recordingUrl,
        contentLanguage: 'en-US',
        // TODO: Restore language when we've got a full account
        // contentLanguage: language,
    });
    return result.data;
}
