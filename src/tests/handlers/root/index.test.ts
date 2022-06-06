import * as handler from '../../../handlers/root';
import { mockHandlerFn } from '../../../../dev/mockHandlerFn';

const get = mockHandlerFn(handler.get);

describe('Greeting message', () => {
    test.each`
        type       | user                    | message            | redirect
        ${'users'} | ${{ isEnrolled: true }} | ${'welcome-known'} | ${'./en-DEV/menu'}
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
