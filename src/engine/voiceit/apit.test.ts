import axios from 'axios';
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;
mockAxios.create.mockReturnValue(mockAxios);
import { createUser, enrolUser } from './api';

describe('voiceIt service', () => {
    beforeEach(() => {
        mockAxios.post.mockClear();
        mockAxios.get.mockClear();
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
            phrase: 'zoo-phrase',
            recordingUrl: 'file.wav',
        });
        expect(mockAxios.post).toHaveBeenCalledWith(
            '/enrollments/voice/byUrl',
            {
                userId: 'user_abc',
                phrase: 'zoo-phrase',
                fileUrl: 'file.wav',
                contentLanguage: 'en-DEV',
            }
        );
        expect(result).toEqual({ resultCode: 'SUCC' });
    });

    test('constructs auth from env', () => {
        const OLD_ENV = process.env;
        require('./api');
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

        require('./api');
        process.env = OLD_ENV; // restore old env
    });
});
