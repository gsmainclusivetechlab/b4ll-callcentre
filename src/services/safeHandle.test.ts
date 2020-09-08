import { safeHandle } from './safeHandle';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import qs from 'querystring';

const params = {
    pathParameters: {
        lang: 'en-GB',
    },
    queryStringParameters: {
        Caller: '+123456789',
    },
};

const postParams = {
    ...params,
    body: qs.stringify(params.queryStringParameters),
    httpMethod: 'POST',
};

describe('safeHandle', () => {
    test.each`
        case                      | params                                        | statusCode | message
        ${'undefined parameters'} | ${{}}                                         | ${500}     | ${'An error occurred. Unsupported language'}
        ${'undefined query'}      | ${{ ...params, queryStringParameters: null }} | ${500}     | ${'An error occurred. Unable to identify caller'}
        ${'undefined caller'}     | ${{ ...params, queryStringParameters: {} }}   | ${500}     | ${'An error occurred. Unable to identify caller'}
        ${'happy flow'}           | ${params}                                     | ${200}     | ${'Hello world'}
        ${'hapy POST flow'}       | ${postParams}                                 | ${200}     | ${'Hello world'}
    `('handles $case', async ({ message, params, statusCode }) => {
        const wrapped = safeHandle(async () => {
            const r = new VoiceResponse();
            r.say('Hello world');
            return r;
        });

        const result = await wrapped(params as never, {} as never, jest.fn);
        expect(result).toMatchObject({
            statusCode: statusCode,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.stringContaining(message),
        });
    });

    test.each`
        type           | error                           | message
        ${'JS Errors'} | ${new Error('Not implemented')} | ${'An error occurred. Not implemented'}
        ${'strings'}   | ${'something weird'}            | ${'An error occurred. something weird'}
        ${'objects'}   | ${{ status: 'bad' }}            | ${'An error occurred. '}
    `('catches $type', async ({ error, message }) => {
        const wrapped = safeHandle(async () => {
            throw error;
        });

        const result = await wrapped(params as never, {} as never, jest.fn);
        expect(result).toMatchObject({
            statusCode: 500,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.stringContaining(message),
        });
    });
});
