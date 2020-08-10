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
        count  | lang       | expected
        ${1}   | ${'fr-FR'} | ${"C'est la première fois que vous appelez."}
        ${2}   | ${'fr-FR'} | ${"C'est la 2ème fois que vous appelez."}
        ${105} | ${'fr-FR'} | ${"C'est la 105ème fois que vous appelez."}
        ${1}   | ${'en-GB'} | ${"This is the 1st time you've called."}
        ${2}   | ${'en-GB'} | ${"This is the 2nd time you've called."}
        ${3}   | ${'en-GB'} | ${"This is the 3rd time you've called."}
        ${4}   | ${'en-GB'} | ${"This is the 4th time you've called."}
        ${200} | ${'en-GB'} | ${"This is the 200th time you've called."}
        ${201} | ${'en-GB'} | ${"This is the 201st time you've called."}
    `(
        'handles the $count-th ordinal in $lang',
        async ({ count, lang, expected }) => {
            expect(__('caller-count', { count }, lang)).toEqual(expected);
        }
    );
});
