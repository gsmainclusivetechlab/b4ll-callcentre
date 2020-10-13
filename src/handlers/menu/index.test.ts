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
        expect(result.toString()).toContain('mobile-money');
        expect(result.toString()).toContain('alert');
        expect(result.toString()).toContain('passphrase-manager');
        expect(result.toString()).toContain('deactivate');
        expect(result.toString()).toMatchSnapshot();
    });
    test.each`
        option                                    | result
        ${{ Digits: '1' }}                        | ${'./mobilemoney'}
        ${{ Digits: '2' }}                        | ${'not-implemented'}
        ${{ Digits: '3' }}                        | ${'not-implemented'}
        ${{ Digits: '4' }}                        | ${'not-implemented'}
        ${{ SpeechResult: 'mobile money' }}       | ${'./mobilemoney'}
        ${{ SpeechResult: 'alert simulation' }}   | ${'not-implemented'}
        ${{ SpeechResult: 'new voice' }}          | ${'not-implemented'}
        ${{ SpeechResult: 'deactivate account' }} | ${'not-implemented'}
        ${{ SpeechResult: 'go swimming' }}        | ${'did-not-understand'}
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
