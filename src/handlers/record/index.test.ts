import { handler as orig } from '.';
import qs from 'querystring';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import { getItem } from '../../services/dynamodb';

const handler = mockHandlerFn(orig);
describe('Recording', () => {
    it('should return well-formed XML to initial request', async () => {
        const result = await handler({
            pathParameters: { lang: 'en-GB' },
            queryStringParameters: { Caller: '+7777777' },
            httpMethod: 'GET',
        });
        expect(result).toMatchObject({
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.any(String),
        });
        expect(result.body).toMatchSnapshot();
    });

    it('should return well-formed XML to subsequent response', async () => {
        const initialItem = await getItem('+7777777');
        expect(initialItem.recordingUrl).not.toEqual(
            'https://my-file-server/voice.wav'
        );
        const result = await handler({
            pathParameters: { lang: 'en-GB' },
            body: qs.stringify({
                Caller: '+7777777',
                RecordingUrl: 'https://my-file-server/voice.wav',
            }),
            httpMethod: 'POST',
        });
        expect(result).toMatchObject({
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.any(String),
        });
        expect(result.body).toMatchSnapshot();
        const savedItem = await getItem('+7777777');
        expect(savedItem.recordingUrl).toEqual(
            'https://my-file-server/voice.wav'
        );
    });

    test.each`
        error                                  | data
        ${'Unable to identify caller'}         | ${{}}
        ${'Unable to identify caller'}         | ${{ queryStringParameters: { Caller: '+1' } }}
        ${'Unsupported language'}              | ${{ queryStringParameters: { Caller: '+7777777' } }}
        ${'Could not retrieve recording URL.'} | ${{ pathParameters: { lang: 'en-GB' }, body: qs.stringify({ Caller: '+7777777' }), httpMethod: 'POST' }}
    `('should gracefully reject: $error', async ({ data }) => {
        const result = await handler(data);
        expect(result.body).toMatchSnapshot();
    });
});
