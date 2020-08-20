import {
    SayLanguage,
    GatherLanguage,
    SayVoice,
} from 'twilio/lib/twiml/VoiceResponse';
import { translations, MessageId } from '../strings';
import formatMessage from 'format-message';

formatMessage.setup({
    translations,
    missingTranslation: 'error', // don't console.warn or throw an error when a translation is missing
});

const supportedLanguages = [
    'en-GB' as const,
    'fr-FR' as const,
    'en-DEV' as const,
];
export type SupportedLanguage = typeof supportedLanguages[number];

export function isSupportedLanguage(
    language: unknown
): language is SupportedLanguage {
    return supportedLanguages.some((l) => l === language);
}

export function getVoiceParams(
    language: SupportedLanguage
): { language: SayLanguage & GatherLanguage; voice: SayVoice } {
    // voice list: https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
    switch (language) {
        case 'en-GB':
        case 'en-DEV':
        default:
            return {
                language: 'en-GB',
                voice: 'Polly.Emma-Neural',
            };
        case 'fr-FR':
            return {
                language,
                voice: 'Polly.Celine',
            };
        // case 'pt-BR':
        //     return {
        //         language,
        //         voice: 'Polly.Vitoria',
        //     };
        // case 'es-ES':
        //     return {
        //         language,
        //         voice: 'Polly.Lucia',
        //     };
    }
}

type Args = Record<string, unknown>;
export function __(id: MessageId, locale: string): string;
export function __(id: MessageId, args: Args, locale: string): string;
export function __(id: string, a: string | Args, b?: string): string {
    const args = typeof a === 'object' ? a : {};
    const locale = isSupportedLanguage(a)
        ? a
        : isSupportedLanguage(b)
        ? b
        : 'en-GB';

    return formatMessage({ id, default: id }, args, locale);
}
