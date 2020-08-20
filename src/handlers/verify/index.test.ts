import * as handler from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import qs from 'querystring';
import * as voiceit from '../../services/voiceit';
const { isLegalPhraseKey } = jest.requireActual('../../services/voiceit');

jest.mock('../../services/voiceit');

const verifyUser = voiceit.verifyUser as jest.MockedFunction<
    typeof voiceit.verifyUser
>;

(voiceit.isLegalPhraseKey as jest.MockedFunction<
    typeof voiceit.isLegalPhraseKey
>).mockImplementation(isLegalPhraseKey);

const get = mockHandlerFn(handler.get);
const post = mockHandlerFn(handler.post);

const mockResponse = {
    message: 'Successfully achieved objective',
    status: 200,
    timeTaken: '0.0',
    responseCode: 'SUCC' as const,
    contentLanguage: 'en-DEV',
    createdAt: 0,
    text: 'zoo-phrase',
    voiceEnrolmentId: '0',
    confidence: 90,
    userId: '',
};

describe('verification flow', () => {
    beforeEach(() => {
        verifyUser.mockReset();
    });

    describe('welcome', () => {
        test.each`
            user                                            | error
            ${{ isEnrolled: false }}                        | ${'You must be enrolled before signing in.'}
            ${{ isEnrolled: true }}                         | ${'No valid phrases found'}
            ${{ isEnrolled: true, enrolments: { Zoo: 2 } }} | ${'No valid phrases found'}
            ${{ isEnrolled: true, enrolments: { Bad: 4 } }} | ${'No valid phrases found'}
        `('should handle error "$error"', async ({ user, error }) => {
            const result = get({
                language: 'en-DEV',
                user: { id: '+77-enrol-get-test', ...user },
            });
            await expect(result).rejects.toThrow(error);
        });

        test('should handle happy flow', async () => {
            const result = await get({
                language: 'en-DEV',
                user: {
                    id: '+77-enrol-get-test',
                    isEnrolled: true,
                    enrolments: { Zoo: 3 },
                },
            });
            expect(result.toString()).toContain('verification-request');
            expect(result.toString()).toContain('zoo-phrase');
            expect(result.toString()).toContain('./verify/Zoo');
        });
    });

    describe('response', () => {
        test.each`
            phraseKey | hasUser  | hasRecording | expected
            ${null}   | ${true}  | ${true}      | ${'Unrecognised phrase key'}
            ${'Zoo'}  | ${true}  | ${false}     | ${'Could not retrieve recording URL.'}
            ${'Zoo'}  | ${false} | ${true}      | ${'VoiceIT user does not exist'}
        `(
            'should handle error "$expected"',
            async ({ phraseKey, hasUser, hasRecording, expected }) => {
                verifyUser.mockResolvedValue({
                    ...mockResponse,
                    responseCode: 'FAIL',
                });
                const response = post({
                    language: 'en-DEV',
                    user: {
                        id: '+77-post-test',
                        ...(hasUser ? { voiceItId: '123' } : null),
                    },
                    event: {
                        ...(phraseKey
                            ? { pathParameters: { phraseKey } }
                            : null),
                        body: qs.stringify(
                            hasRecording ? { RecordingUrl: 'file.wav' } : {}
                        ),
                    },
                });
                expect(response).rejects.toThrow(expected);
            }
        );
    });

    test('should handle unsuccessful enrolment', async () => {
        verifyUser.mockResolvedValue({ ...mockResponse, responseCode: 'FAIL' });

        const response = await post({
            language: 'en-DEV',
            user: {
                id: '+77-enrol-post-test',
                voiceItId: 'v',
                isEnrolled: true,
                enrolments: { Zoo: 3 },
            },
            event: {
                pathParameters: { phraseKey: 'Zoo' },
                body: qs.stringify({ RecordingUrl: 'file.wav' }),
            },
        });

        expect(response.toString()).toContain('verification-failed');
        expect(response.toString()).toContain('../verify');
    });

    test('should handle successful enrolment', async () => {
        verifyUser.mockResolvedValue(mockResponse);

        const response = await post({
            language: 'en-DEV',
            user: {
                id: '+77-enrol-post-test',
                voiceItId: 'v',
                isEnrolled: true,
                enrolments: { Zoo: 3 },
            },
            event: {
                pathParameters: { phraseKey: 'Zoo' },
                body: qs.stringify({ RecordingUrl: 'file.wav' }),
            },
        });

        expect(response.toString()).toContain(
            'verification-confirmation: confidence 90%'
        );
        expect(response.toString()).toContain('../menu');
    });
});
