import { handler as orig } from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

const handler = mockHandlerFn(orig);
describe('Greeting message', () => {
    it('should return well-formed XML', async () => {
        const result = (await handler({
            pathParameters: { lang: 'fr-FR' },
        })) as APIGatewayProxyStructuredResultV2;
        expect(result).toMatchObject({
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.any(String),
        });
        expect(result.body).toMatchInlineSnapshot(`
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say language="fr-FR" voice="Polly.Celine">
                    Bonjour!
                </Say>
                <Say language="fr-FR" voice="Polly.Celine">
                    Vous etes le 1er appeleur.
                </Say>
            </Response>
        `);
    });

    it('should increment caller count', async () => {
        const result = (await handler({
            pathParameters: { lang: 'en-GB' },
        })) as APIGatewayProxyStructuredResultV2;
        expect(result).toMatchObject({
            statusCode: 200,
            body: expect.stringContaining('You are the 2nd caller.'),
        });
    });

    it('should gracefully reject unknown languages', async () => {
        const result = (await handler({})) as APIGatewayProxyStructuredResultV2;
        expect(result.body).toMatchInlineSnapshot(`
            <?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say language="en-GB" voice="Polly.Amy">
                    An error occurred. Unsupported language
                </Say>
            </Response>
        `);
    });
});
