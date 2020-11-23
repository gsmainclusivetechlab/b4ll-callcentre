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
        expect(mockAxios.post).toHaveBeenCalledWith(
            'https://api.voiceit.io/users'
        );
        expect(result).toEqual({ resultCode: 'SUCC' });
    });

    test('enrolUser should call api', async () => {
        mockAxios.post.mockResolvedValueOnce({ data: { resultCode: 'SUCC' } });
        const result = await enrolUser('user_abc', 'en-DEV', {
            phrase: 'zoo-phrase',
            recordingUrl: 'file.wav',
        });
        expect(result).toEqual({ resultCode: 'SUCC' });
    });
});
