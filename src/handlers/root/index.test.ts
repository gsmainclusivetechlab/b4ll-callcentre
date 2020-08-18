import * as orig from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';

const get = mockHandlerFn(orig.get);

describe('Greeting message', () => {
    test.each`
        type                | user                    | message               | redirect
        ${'strangers'}      | ${{}}                   | ${'welcome-stranger'} | ${'./en-DEV/enrol'}
        ${'enrolled users'} | ${{ isEnrolled: true }} | ${'welcome-known'}    | ${'./en-DEV/verify'}
    `('should greet $type', async ({ user, message, redirect }) => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-root-test', ...user },
        });
        expect(result.toString()).toContain(message);
        expect(result.toString()).toContain(redirect);
        expect(result.toString()).toMatchSnapshot();
    });
});
