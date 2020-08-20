import * as handler from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import qs from 'querystring';
import * as voiceit from '../../services/voiceit';
import * as dynamodb from '../../services/dynamodb';
const { isLegalPhraseKey } = jest.requireActual('../../services/voiceit');

jest.mock('../../services/voiceit');
jest.mock('../../services/dynamodb');

const createUser = voiceit.createUser as jest.MockedFunction<
    typeof voiceit.createUser
>;
const enrolUser = voiceit.enrolUser as jest.MockedFunction<
    typeof voiceit.enrolUser
>;
const putItem = dynamodb.putItem as jest.MockedFunction<
    typeof dynamodb.putItem
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
};

describe('enrolment flow', () => {
    beforeEach(() => {
        createUser.mockReset();
        enrolUser.mockReset();
        putItem.mockReset();
    });

    test('should create a user when necessary', async () => {
        createUser.mockResolvedValue({
            ...mockResponse,
            userId: 'id_voiceit',
            createdAt: 0,
        });
        let result = await get({
            language: 'en-DEV',
            user: { id: '+77-enrol-get-test' },
        });
        expect(createUser).toHaveBeenCalled();
        expect(putItem).toHaveBeenCalledWith({
            id: '+77-enrol-get-test',
            voiceItId: 'id_voiceit',
        });
        createUser.mockReset();
        putItem.mockReset();
        result = await get({
            language: 'en-DEV',
            user: { id: '+77-enrol-get-test', voiceItId: 'id_voiceit' },
        });
        expect(createUser).not.toHaveBeenCalled();
        expect(putItem).not.toHaveBeenCalled();

        expect(result.toString()).toContain('enrol-message');
        expect(result.toString()).toContain('tomorrow-phrase');
        expect(result.toString()).toContain('./enrol/Tomorrow');
        expect(result.toString()).toMatchSnapshot();
    });
    test.each`
        phraseKey | hasUser  | hasRecording | expected
        ${null}   | ${true}  | ${true}      | ${'Unrecognised phrase key'}
        ${'Zoo'}  | ${true}  | ${false}     | ${'Could not retrieve recording URL.'}
        ${'Zoo'}  | ${false} | ${true}      | ${'VoiceIT user does not exist'}
        ${'Zoo'}  | ${true}  | ${true}      | ${'Enrolment failed'}
    `(
        'should handle error "$expected"',
        async ({ phraseKey, hasUser, hasRecording, expected }) => {
            enrolUser.mockResolvedValue({
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
                    ...(phraseKey ? { pathParameters: { phraseKey } } : null),
                    body: qs.stringify(
                        hasRecording ? { RecordingUrl: 'file.wav' } : {}
                    ),
                },
            });
            await expect(response).rejects.toThrow(expected);
        }
    );

    // test.each`
    //     phraseKey | user                    | body                           | result | expected
    //     ${'fake'} | ${{}}                   | ${{}}                          | ${{}}  | ${new Error('Unrecognised phrase key')}
    //     ${'Zoo'}  | ${{}}                   | ${{}}                          | ${{}}  | ${new Error('Could not retrieve recording URL.')}
    //     ${'Zoo'}  | ${{}}                   | ${{ RecordingUrl: 'foo.wav' }} | ${{}}  | ${new Error('VoiceIT user does not exist')}
    //     ${'Zoo'}  | ${{ voiceItId: '123' }} | ${{ RecordingUrl: 'foo.wav' }} | ${{}}  | ${new Error('Enrolment Failed')}
    // `(
    test('should collect first enrolments', async () => {
        enrolUser.mockResolvedValue(mockResponse);

        const response = await post({
            language: 'en-DEV',
            user: { id: '+77-enrol-post-test', voiceItId: 'v' },
            event: {
                pathParameters: { phraseKey: 'Zoo' },
                body: qs.stringify({ RecordingUrl: 'file.wav' }),
            },
        });

        expect(putItem).toHaveBeenCalledWith({
            id: '+77-enrol-post-test',
            voiceItId: 'v',
            enrolments: { Zoo: 1 },
            isEnrolled: false,
        });

        expect(response.toString()).toContain(
            'enrol-confirmation: 2 remaining'
        );
        expect(response.toString()).toContain('zoo-phrase');
    });

    test('should collect last enrolments', async () => {
        enrolUser.mockResolvedValue(mockResponse);

        const response = await post({
            language: 'en-DEV',
            user: {
                id: '+77-enrol-post-test',
                voiceItId: 'v',
                enrolments: { Zoo: 2 },
            },
            event: {
                pathParameters: { phraseKey: 'Zoo' },
                body: qs.stringify({ RecordingUrl: 'file.wav' }),
            },
        });

        expect(putItem).toHaveBeenCalledWith({
            id: '+77-enrol-post-test',
            voiceItId: 'v',
            enrolments: { Zoo: 3 },
            isEnrolled: true,
        });

        expect(response.toString()).toContain('enrolment-complete');
        expect(response.toString()).toContain('../menu');
    });
});
