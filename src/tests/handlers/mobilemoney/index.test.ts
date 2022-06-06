import * as handler from '../../../handlers/mobilemoney';
import { mockHandlerFn } from '../../../../dev/mockHandlerFn';
import qs from 'querystring';

const get = mockHandlerFn(handler.get);
const post = mockHandlerFn(handler.post);

describe('mobileMoneyMenu', () => {
    test('should list correct options', async () => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-menu-test' },
        });
        expect(result.toString()).toContain('mobile-money-balance');
        expect(result.toString()).toContain('pay-bill');
        expect(result.toString()).toContain('transfer');
        expect(result.toString()).toMatchSnapshot();
    });
    test.each`
        option                                     | result
        ${{ Digits: '1' }}                         | ${'./mobilemoney/account-info'}
        ${{ Digits: '2' }}                         | ${'./mobilemoney/pay-bill'}
        ${{ Digits: '3' }}                         | ${'./mobilemoney/transfer'}
        ${{ SpeechResult: 'account information' }} | ${'./mobilemoney/account-info'}
        ${{ SpeechResult: 'pay bill' }}            | ${'./mobilemoney/pay-bill'}
        ${{ SpeechResult: 'make transfer' }}       | ${'./mobilemoney/transfer'}
        ${{ SpeechResult: 'go swimming' }}         | ${'did-not-understand'}
    `('should respond to $option', async ({ option, result }) => {
        const response = await post({
            language: 'en-DEV',
            user: { id: '+77-menu-test' },
            event: { body: qs.stringify(option) },
        });
        expect(response.toString()).toContain(result);
        expect(response.toString()).toMatchSnapshot();
    });
});
