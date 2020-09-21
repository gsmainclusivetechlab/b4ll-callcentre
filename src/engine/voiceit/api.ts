import VoiceIt2 from 'voiceit2-nodejs';
import { VoiceIt } from 'voiceit2-nodejs';

export const REQUIRED_ENROLMENTS = 3;

const myVoiceIt = new VoiceIt2(
    process.env.VOICEIT_API_KEY || '',
    process.env.VOICEIT_API_TOKEN || ''
);

export async function createUser(): Promise<VoiceIt.Response<VoiceIt.User>> {
    return new Promise<VoiceIt.Response<VoiceIt.User>>((resolve) => {
        myVoiceIt.createUser((callback) => {
            resolve(callback);
        });
    });
}
interface ArrayEnrolment {
    createdAt: string;
    contentLanguage: string;
    voiceEnrollmentId: number;
    text: string;
}

export async function getPhrases(
    language: VoiceIt.ContentLanguage
): Promise<
    VoiceIt.Response<{
        count: number;
        phrases: VoiceIt.Phrase[];
    }>
> {
    return new Promise<
        VoiceIt.Response<{
            count: number;
            phrases: VoiceIt.Phrase[];
        }>
    >((resolve) => {
        myVoiceIt.getPhrases(
            {
                contentLanguage: language,
            },
            (callback) => {
                resolve(callback);
            }
        );
    });
}

export async function getEnrolledPhrases(
    userId: string,
    language: string
): Promise<Record<string, number>> {
    let results = {
        message:
            'Successfully got all voice enrollments for user with userId : usr_feb6d1fcd80448628db8ec6a7ddb6322',
        count: 2,
        status: 200,
        timeTaken: '0.079s',
        voiceEnrollments: [
            {
                createdAt: 1487026658003,
                contentLanguage: 'en-US',
                voiceEnrollmentId: 73,
                text: 'never forget tomorrow is a new day',
            },
        ],
        responseCode: 'SUCC',
    };

    return new Promise<Record<string, number>>((resolve) => {
        myVoiceIt.getAllVoiceEnrollments(
            {
                userId: userId,
            },
            (callback) => {
                results = callback;
                const phrases = ((results.voiceEnrollments as unknown) as ArrayEnrolment[])
                    .map(
                        ([
                            id,
                            encodedPhrase,
                            contentLanguage,
                            createdAt,
                        ]): VoiceIt.VoiceEnrolment => ({
                            voiceEnrollmentId: id,
                            contentLanguage,
                            createdAt,
                            text: Buffer.from(encodedPhrase, 'base64').toString(
                                'utf8'
                            ),
                        })
                    )
                    .filter((x) => x.contentLanguage === language)
                    .map((x) => x.text);
                resolve(
                    phrases.reduce(
                        (acc, curr) => ({
                            ...acc,
                            [curr]: (acc[curr] || 0) + 1,
                        }),
                        {} as Record<string, number>
                    )
                );
            }
        );
    });
}

export async function enrolUser(
    userId: string,
    language: VoiceIt.ContentLanguage,
    enrolment: {
        phrase: string;
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>> {
    return new Promise<VoiceIt.Response<VoiceIt.VoiceEnrolment>>((resolve) => {
        myVoiceIt.createVoiceEnrollmentByUrl(
            {
                userId: userId,
                contentLanguage: language,
                phrase: enrolment.phrase,
                audioFileURL: enrolment.recordingUrl,
            },
            (jsonResponse) => {
                resolve(jsonResponse);
            }
        );
    });
}

export async function verifyUser(
    userId: string,
    language: VoiceIt.ContentLanguage,
    enrolment: {
        phrase: string;
        recordingUrl: string;
    }
): Promise<VoiceIt.Response<{ confidence: number }>> {
    return new Promise<VoiceIt.Response<{ confidence: number }>>((resolve) => {
        myVoiceIt.voiceVerificationByUrl(
            {
                userId,
                phrase: enrolment.phrase,
                audioFileURL: enrolment.recordingUrl,
                contentLanguage: language,
            },
            (callback) => {
                resolve(callback);
            }
        );
    });
}
