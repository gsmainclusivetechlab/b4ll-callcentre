import dev from './en-DEV.json';
import en from './en-GB.json';
import fr from './fr-FR.json';
import { SupportedLanguage } from '../services/strings';

export type MessageId = keyof typeof en & keyof typeof fr & keyof typeof dev;

export const translations: Record<
    SupportedLanguage,
    Record<MessageId, string>
> = {
    'en-DEV': dev,
    'en-GB': en,
    'fr-FR': fr,
};
