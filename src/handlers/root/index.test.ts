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
        answer                               | message                 | user
        ${{ Digits: '1' }}                   | ${'./en-DEV/record'}    | ${{}}
        ${{ Digits: '2' }}                   | ${'not-implemented'}    | ${{}}
        ${{ Digits: '3' }}                   | ${'not-implemented'}    | ${{}}
        ${{ Digits: '4' }}                   | ${'not-implemented'}    | ${{}}
        ${{ Digits: '5' }}                   | ${'did-not-understand'} | ${{}}
        ${{ Digits: '2' }}                   | ${'voice.wav'}          | ${{ recordingUrl: 'voice.wav' }}
        ${{ SpeechResult: 'record' }}        | ${'./en-DEV/record'}    | ${{}}
        ${{ SpeechResult: 'listen' }}        | ${'voice.wav'}          | ${{ recordingUrl: 'voice.wav' }}
        ${{ SpeechResult: 'swimming pool' }} | ${'did-not-understand'} | ${{}}
        ${null}                              | ${'did-not-understand'} | ${{}}
    `('should process answer $answer', async ({ answer, message, user }) => {
        const result = await post({
            language: 'en-DEV',
            user: { id: '+77-root-test', ...user },
            event: {
                body: answer && qs.stringify(answer),
            },
        });
        if (message !== null) {
            expect(result.toString()).toContain(message);
        }
        expect(result.toString()).toMatchSnapshot();
    });
});
