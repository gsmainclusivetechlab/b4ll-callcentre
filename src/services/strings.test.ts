import { isSupportedLanguage, __ } from './strings';

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

describe('i18n', () => {
    test('translates without data', () => {
        expect(__('welcome', 'en-GB')).toEqual('Hello there!');
        expect(__('welcome', 'fr-FR')).toEqual('Bonjour!');
        expect(__('welcome', 'pt-BR')).toEqual('Hello there!');
    });

    test.each`
        count  | lang       | expected
        ${1}   | ${'fr-FR'} | ${'Vous etes le 1er appeleur.'}
        ${2}   | ${'fr-FR'} | ${'Vous etes le 2ème appeleur.'}
        ${105} | ${'fr-FR'} | ${'Vous etes le 105ème appeleur.'}
        ${1}   | ${'en-GB'} | ${'You are the 1st caller.'}
        ${2}   | ${'en-GB'} | ${'You are the 2nd caller.'}
        ${3}   | ${'en-GB'} | ${'You are the 3rd caller.'}
        ${4}   | ${'en-GB'} | ${'You are the 4th caller.'}
        ${200} | ${'en-GB'} | ${'You are the 200th caller.'}
        ${201} | ${'en-GB'} | ${'You are the 201st caller.'}
    `(
        'handles the $count-th ordinal in $lang',
        async ({ count, lang, expected }) => {
            expect(__('caller-count', { count }, lang)).toEqual(expected);
        }
    );
});
