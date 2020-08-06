import { handler as orig } from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';

const handler = mockHandlerFn(orig);
describe('Greeting message', () => {
    it('should return well-formed XML', async () => {
        const result = await handler({
            pathParameters: { lang: 'fr-FR' },
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

    it('should gracefully reject unknown languages', async () => {
        const result = (await handler({}));
        expect(result.body).toMatchSnapshot();
    });
});
