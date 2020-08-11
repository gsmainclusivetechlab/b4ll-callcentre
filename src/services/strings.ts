import { SayAttributes } from 'twilio/lib/twiml/VoiceResponse';
import { translations, MessageId } from '../strings';
import formatMessage from 'format-message';

formatMessage.setup({
    translations,
    missingTranslation: 'error', // don't console.warn or throw an error when a translation is missing
});

export type SupportedLanguage = 'en-GB' | 'fr-FR';

export function isSupportedLanguage(
    language: unknown
): language is SupportedLanguage {
    if (typeof language !== 'string') return false;
    return ['en-GB', 'fr-FR'].indexOf(language) >= 0;
}

export function getVoiceParams(language: SupportedLanguage): SayAttributes {
    // voice list: https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
    switch (language) {
        case 'en-GB':
        default:
            return {
                language,
                voice: 'Polly.Emma-Neural',
            };
        case 'fr-FR':
            return {
                language,
                voice: 'Polly.Celine',
            };
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
