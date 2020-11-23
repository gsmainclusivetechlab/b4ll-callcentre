import VoiceIt2, { VoiceIt } from 'voiceit2-nodejs';

export const REQUIRED_ENROLMENTS = 3;

const myVoiceIt = new VoiceIt2(
    process.env.VOICEIT_API_KEY || '',
    process.env.VOICEIT_API_TOKEN || ''
);

export const createUser = () =>
    new Promise<VoiceIt.Response<VoiceIt.User>>(myVoiceIt.createUser);

export async function getPhrases(contentLanguage: VoiceIt.ContentLanguage) {
    return new Promise<
        VoiceIt.Response<{
            count: number;
            phrases: VoiceIt.Phrase[];
        }>
    >((resolve) => myVoiceIt.getPhrases({ contentLanguage }, resolve));
}

export async function getEnrolledPhrases(userId: string, language: string) {
    return new Promise<Record<string, number>>((resolve) => {
        myVoiceIt.getAllVoiceEnrollments(
            {
                userId,
            },
            (data) =>
                resolve(
                    data.voiceEnrollments
                        .filter((x) => x.contentLanguage === language)
                        .map((x) => x.text)
                        .reduce(
                            (acc, curr) => ({
                                ...acc,
                                [curr]: (acc[curr] || 0) + 1,
                            }),
                            {} as Record<string, number>
                        )
                )
        );
    });
}

export async function enrolUser(
    userId: string,
    contentLanguage: VoiceIt.ContentLanguage,
    enrolment: {
        phrase: string;
        recordingUrl: string;
    }
) {
    return new Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>>((resolve) =>
        myVoiceIt.createVoiceEnrollmentByUrl(
            {
                userId,
                contentLanguage,
                phrase: enrolment.phrase,
                audioFileURL: enrolment.recordingUrl,
            },
            resolve
        )
    );
}

export async function verifyUser(
    userId: string,
    contentLanguage: VoiceIt.ContentLanguage,
    enrolment: {
        phrase: string;
        recordingUrl: string;
    }
) {
    return new Promise<VoiceIt.Response<{ confidence: number }>>((resolve) =>
        myVoiceIt.voiceVerificationByUrl(
            {
                userId,
                contentLanguage,
                phrase: enrolment.phrase,
                audioFileURL: enrolment.recordingUrl,
            },
            resolve
        )
    );
}
