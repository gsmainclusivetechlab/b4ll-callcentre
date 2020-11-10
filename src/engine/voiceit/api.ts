import { VoiceIt } from 'voiceit2-nodejs';
import axios from 'axios';

export const REQUIRED_ENROLMENTS = 3;

const auth = {
    username: process.env.VOICEIT_API_KEY || '',
    password: process.env.VOICEIT_API_TOKEN || '',
};
const api = axios.create({
    baseURL: 'https://api.voiceit.io/',
    auth,
});

export async function createUser(): Promise<VoiceIt.Response<VoiceIt.User>> {
    const result = await api.post('/users');
    return result.data;
}

export async function getPhrases(
    language: string
): Promise<VoiceIt.VoiceEnrolment[]> {
    const result = await api.get(`/phrases/${language}`);
    return result.data.phrases || [];
}

interface ArrayEnrolment {
    createdAt: string;
    contentLanguage: string;
    voiceEnrollmentId: number;
    text: string;
}

export async function getEnrolledPhrases(
    userId: string,
    language: string
): Promise<Record<string, number>> {
    const results = await api.get(`/enrollments/voice/${userId}`);
    const phrases = (results.data.voiceEnrollments as ArrayEnrolment[])
        .filter((x) => x.contentLanguage === language)
        .map((x) => x.text);
    return phrases.reduce(
        (acc, curr) => ({
            ...acc,
            [curr]: (acc[curr] || 0) + 1,
        }),
        {} as Record<string, number>
    );
}

export async function enrolUser(
    userId: string,
    language: string,
    enrolment: {
        phrase: string;
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>> {
    const result = await api.post('/enrollments/voice/byUrl', {
        userId,
        phrase: enrolment.phrase,
        fileUrl: enrolment.recordingUrl,
        contentLanguage: language,
    });
    return result.data;
}

export async function verifyUser(
    userId: string,
    language: string,
    enrolment: {
        phrase: string;
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<{ confidence: number }>> {
    const result = await api.post('/verification/voice/byUrl', {
        userId,
        phrase: enrolment.phrase,
        fileUrl: enrolment.recordingUrl,
        contentLanguage: language,
    });
    return result.data;
}
