import * as handler from '../../../../handlers/mobilemoney/account-info';
import { mockHandlerFn } from '../../../../../dev/mockHandlerFn';

const get = mockHandlerFn(handler.get);

describe('Balance information', () => {
    it('should return balance', async () => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-menu-test', balanceAmount: 100 },
        });
        expect(result.toString()).toContain('mobile-money-info 100');
    });
});
