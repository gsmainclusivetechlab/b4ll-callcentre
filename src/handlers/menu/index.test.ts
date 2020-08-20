import * as handler from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import qs from 'querystring';

const get = mockHandlerFn(handler.get);
const post = mockHandlerFn(handler.post);

describe('menu', () => {
    test('should list correct options', async () => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-menu-test' },
        });
        expect(result.toString()).toContain('mobile-money-prompt');
        expect(result.toString()).toContain('bill-prompt');
        expect(result.toString()).toContain('account-prompt');
        expect(result.toString()).toMatchSnapshot();
    });
    test.each`
        option                                | result
        ${{ Digits: '1' }}                    | ${'not-implemented'}
        ${{ Digits: '2' }}                    | ${'not-implemented'}
        ${{ Digits: '3' }}                    | ${'not-implemented'}
        ${{ SpeechResult: 'mobile money' }}   | ${'not-implemented'}
        ${{ SpeechResult: 'pay bill' }}       | ${'not-implemented'}
        ${{ SpeechResult: 'update account' }} | ${'not-implemented'}
        ${{ SpeechResult: 'go swimming' }}    | ${'did-not-understand'}
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
