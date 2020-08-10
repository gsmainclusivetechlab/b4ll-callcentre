import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import * as orig from '.';
import qs from 'querystring';
import { getItem } from '../../services/dynamodb';

const get = mockHandlerFn(orig.get);
const post = mockHandlerFn(orig.post);

describe('Recording', () => {
    it('should return well-formed XML to initial request', async () => {
        const result = await get({
            language: 'en-GB',
            user: { id: '+77-record-test' },
        });
        expect(result.toString()).toMatchSnapshot();
    });

    it('should return well-formed XML to subsequent response', async () => {
        const initialItem = await getItem('+77-record-test');
        expect(initialItem.recordingUrl).not.toEqual(
            'https://my-file-server/voice.wav'
        );
        const result = await post({
            language: 'en-GB',
            user: { id: '+77-record-test' },
            event: {
                body: qs.stringify({
                    RecordingUrl: 'https://my-file-server/voice.wav',
                }),
            },
        });
        expect(result.toString()).toMatchSnapshot();
        const savedItem = await getItem('+77-record-test');
        expect(savedItem.recordingUrl).toEqual(
            'https://my-file-server/voice.wav'
        );
    });

    it('should gracefully handle unexpected requests', async () => {
        expect(
            post({
                language: 'en-GB',
                user: { id: '+77-record-test' },
            })
        ).rejects.toThrow('Could not retrieve recording URL.');
    });
});
