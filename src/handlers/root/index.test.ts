import * as orig from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';
import qs from 'querystring';

const get = mockHandlerFn(orig.get);
const post = mockHandlerFn(orig.post);

describe('Greeting message', () => {
    test.each`
        type                | user                             | message
        ${'strangers'}      | ${{}}                            | ${'welcome-stranger'}
        ${'enrolled users'} | ${{ recordingUrl: 'hello.wav' }} | ${'welcome-known'}
    `('should greet $type', async ({ user, message }) => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-root-test', ...user },
        });
        expect(result.toString()).toContain(message);
        expect(result.toString()).toMatchSnapshot();
    });

    test.each`
        answer                               | redirect            | user
        ${{ Digits: '1' }}                   | ${'./en-GB/record'} | ${{}}
        ${{ Digits: '2' }}                   | ${'./en-GB/count'}  | ${{}}
        ${{ Digits: '4' }}                   | ${null}             | ${{}}
        ${{ SpeechResult: 'record' }}        | ${'./en-GB/record'} | ${{}}
        ${{ SpeechResult: 'listen' }}        | ${'voice.wav'}      | ${{ recordingUrl: 'voice.wav' }}
        ${{ SpeechResult: 'swimming pool' }} | ${null}             | ${{}}
        ${null}                              | ${null}             | ${{}}
    `('should process answer $answer', async ({ answer, redirect, user }) => {
        const result = await post({
            language: 'en-GB',
            user: { id: '+77-root-test', ...user },
            event: {
                body: answer && qs.stringify(answer),
            },
        });
        if (redirect !== null) {
            expect(result.toString()).toContain(redirect);
        }
        expect(result.toString()).toMatchSnapshot();
    });
});
