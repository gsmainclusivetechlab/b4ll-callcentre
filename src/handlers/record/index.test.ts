import { handler as orig } from '.';
import qs from 'querystring';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { getItem } from '../../services/dynamodb';

const handler = mockHandlerFn(orig);
describe('Recording', () => {
    it('should return well-formed XML to initial request', async () => {
        const result = (await handler({
            pathParameters: { lang: 'en-GB' },
            queryStringParameters: { Caller: '+7777777' },
            requestContext: {
                http: {
                    method: 'GET',
                },
            },
        })) as APIGatewayProxyStructuredResultV2;
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
        const result = (await handler({
            pathParameters: { lang: 'en-GB' },
            body: qs.stringify({
                Caller: '+7777777',
                RecordingUrl: 'https://my-file-server/voice.wav',
            }),
            requestContext: {
                http: {
                    method: 'POST',
                },
            },
        })) as APIGatewayProxyStructuredResultV2;
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

    test.each([
        {
            data: {},
            error: 'Unable to identify caller',
        },
        {
            data: { queryStringParameters: { Caller: '+1' } },
            error: 'Unable to identify caller',
        },
        {
            data: { queryStringParameters: { Caller: '+7777777' } },
            error: 'Unsupported language',
        },
        {
            data: {
                pathParameters: { lang: 'en-GB' },
                body: qs.stringify({
                    Caller: '+7777777',
                }),
                requestContext: {
                    http: {
                        method: 'POST',
                    },
                },
            },
            error: 'Could not retrieve recording URL.',
        },
    ])('should gracefully reject: $error', async ({ data }) => {
        const result = (await handler(
            data
        )) as APIGatewayProxyStructuredResultV2;
        expect(result.body).toMatchSnapshot();
    });
});
