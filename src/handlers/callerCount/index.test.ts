import { handler as orig } from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';

const handler = mockHandlerFn(orig);
describe('Caller count', () => {
    it('should return well-formed XML', async () => {
        const result = (await handler({
            pathParameters: { lang: 'en-GB' },
            queryStringParameters: { Caller: '+7777777' },
        }));
        expect(result).toMatchObject({
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.any(String),
        });
        expect(result.body).toMatchSnapshot();
    });

    it('should increment caller count', async () => {
        const result = (await handler({
            pathParameters: { lang: 'en-GB' },
            queryStringParameters: { Caller: '+7777777' },
        }));
        expect(result).toMatchObject({
            statusCode: 200,
            body: expect.stringContaining(
                "This is the 2nd time you've called."
            ),
        });
    });
    test.each`
        error                          | data
        ${'Unable to identify caller'} | ${{}}
        ${'Unable to identify caller'} | ${{ queryStringParameters: { Caller: '+1' } }}
        ${'Unsupported language'}      | ${{ queryStringParameters: { Caller: '+7777777' } }}
    `('should gracefully reject: $error', async ({ data }) => {
        const result = (await handler(
            data
        ));
        expect(result.body).toMatchSnapshot();
    });
});
