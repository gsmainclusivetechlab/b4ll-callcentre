import { safeHandle } from './errors';
import { mockHandlerFn } from '../../dev/mockHandlerFn';

describe('safeHandle', () => {
    test.each`
        type         | lang         | error                           | message
        ${'errors'}  | ${'en-GB'}   | ${new Error('Not implemented')} | ${'An error occurred. Not implemented'}
        ${'errors'}  | ${undefined} | ${new Error('Not implemented')} | ${'An error occurred. Not implemented'}
        ${'strings'} | ${'fr-FR'}   | ${'something weird'}            | ${"Une erreur s'est produite. something weird"}
        ${'objects'} | ${'fr-FR'}   | ${{ status: 'bad' }}            | ${"Une erreur s'est produite. "}
    `('catches $type in $lang', async ({ error, message, lang }) => {
        const wrapped = safeHandle(async () => {
            throw error;
        });

        const result = await mockHandlerFn(wrapped)({
            pathParameters: lang ? { lang } : undefined,
        });
        expect(result).toMatchObject({
            statusCode: 500,
            headers: {
                'Content-Type': 'text/xml',
            },
            body: expect.stringContaining(message),
        });
    });
});
