import { isSupportedLanguage, __, getVoiceParams } from './strings';

describe('isSupportedLangage', () => {
    it.each`
        d            | result
        ${'en-GB'}   | ${true}
        ${'fr-FR'}   | ${true}
        ${'pt-BR'}   | ${false}
        ${'en-US'}   | ${false}
        ${'english'} | ${false}
        ${42}        | ${false}
    `('handles $d', ({ d, result }) =>
        expect(isSupportedLanguage(d)).toBe(result)
    );
});

describe('voiceParams', () => {
    test.each`
        language     | voice
        ${undefined} | ${'Polly.Amy'}
        ${'fr-FR'}   | ${'Polly.Celine'}
        ${'en-GB'}   | ${'Polly.Amy'}
    `('picks the right voice for $lang', async ({ language, voice }) => {
        expect(getVoiceParams(language)).toEqual({ language, voice });
    });
});

describe('i18n', () => {
    test('translates without data', () => {
        expect(__('test', 'en-GB')).toEqual('Hello there!');
        expect(__('test', 'fr-FR')).toEqual('Bonjour!');
        expect(__('test', 'pt-BR')).toEqual('Hello there!');
    });

    test.each`
        count  | lang       | ordinal
        ${1}   | ${'fr-FR'} | ${'première'}
        ${2}   | ${'fr-FR'} | ${'2ème'}
        ${105} | ${'fr-FR'} | ${'105ème'}
        ${1}   | ${'en-GB'} | ${'1st'}
        ${2}   | ${'en-GB'} | ${'2nd'}
        ${3}   | ${'en-GB'} | ${'3rd'}
        ${4}   | ${'en-GB'} | ${'4th'}
        ${200} | ${'en-GB'} | ${'200th'}
        ${201} | ${'en-GB'} | ${'201st'}
    `(
        'handles the $count-th ordinal in $lang',
        async ({ count, lang, ordinal }) => {
            expect(__('caller-count', { count }, lang)).toContain(ordinal);
        }
    );
});
