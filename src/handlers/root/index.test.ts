import { handler as orig } from './hello';
import { wrapHandlerFn } from '../dev/wrapHandlerFn';

const handler = wrapHandlerFn(orig);

describe('Hello handler', () => {
    it('should greet user', async () => {
        let result = await handler({ pathParameters: { name: 'James' } });
        expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello James',
                count: 1,
            }),
        });
        result = await handler({ pathParameters: { name: 'James' } });
        expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello James',
                count: 2,
            }),
        });
    });

    it('should greet unknown users', async () => {
        const result = await handler({});
        expect(result).toEqual({
            statusCode: 200,
            body: JSON.stringify({
                message: 'Hello World',
                count: 1,
            }),
        });
    });

    it('should handle errors', async () => {
        const result = await handler({
            pathParameters: { name: (15 as unknown) as string },
        });
        expect(result).toMatchObject({
            statusCode: 500,
            body: expect.stringContaining(
                'One or more parameter values were invalid'
            ),
        });
    });
});
