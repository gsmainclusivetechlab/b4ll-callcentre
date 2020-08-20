import axios from 'axios';
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;
mockAxios.create.mockReturnValue(mockAxios);
import { isLegalPhraseKey, createUser, enrolUser, verifyUser } from './voiceit';

describe('voiceIt service', () => {
    beforeEach(() => {
        mockAxios.post.mockClear();
        mockAxios.get.mockClear();
    });

    test('isLegalPhraseKey', async () => {
        expect(isLegalPhraseKey('en-DEV', 'bad')).toBeFalsy();
        expect(isLegalPhraseKey('en-DEV', 'Zoo')).toBeTruthy();
        expect(isLegalPhraseKey('en-DEV', 0)).toBeFalsy();
        expect(isLegalPhraseKey('en-DEV', { phraseKey: 'Zoo' })).toBeFalsy();
        expect(isLegalPhraseKey('fr-FR', 'Zoo')).toBeFalsy();
    });

    test('createUser should call api', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: { resultCode: 'SUCC' } });
        const result = await createUser();
        expect(mockAxios.post).toHaveBeenCalledWith('/users');
        expect(result).toEqual({ resultCode: 'SUCC' });
    });

    test('enrolUser should call api', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: { resultCode: 'SUCC' } });
        const result = await enrolUser('user_abc', 'en-DEV', {
            phrase: 'Zoo',
            recordingUrl: 'file.wav',
        });
        expect(mockAxios.post).toHaveBeenCalledWith(
            '/enrollments/voice/byUrl',
            {
                userId: 'user_abc',
                phrase: 'zoo-phrase',
                fileUrl: 'file.wav',
                contentLanguage: 'en-US',
            }
        );
        expect(result).toEqual({ resultCode: 'SUCC' });
    });

    test('verifyUser should call api', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: { resultCode: 'SUCC' } });
        const result = await verifyUser('user_abc', 'en-DEV', {
            phrase: 'Zoo',
            recordingUrl: 'file.wav',
        });
        expect(mockAxios.post).toHaveBeenCalledWith(
            '/verification/voice/byUrl',
            {
                userId: 'user_abc',
                phrase: 'zoo-phrase',
                fileUrl: 'file.wav',
                contentLanguage: 'en-US',
            }
        );
        expect(result).toEqual({ resultCode: 'SUCC' });
    });

    test('constructs auth from env', () => {
        const OLD_ENV = process.env;
        require('./voiceit');
        expect(mockAxios.create).toHaveBeenCalledWith({
            baseURL: 'https://api.voiceit.io/',
            auth: {
                username: 'key_voiceit',
                password: 'tok_voiceit',
            },
        });

        jest.resetModules();
        process.env = {
            ...OLD_ENV,
            VOICEIT_API_KEY: undefined,
            VOICEIT_API_TOKEN: undefined,
        };

        require('./voiceit');
        process.env = OLD_ENV; // restore old env
    });
});
