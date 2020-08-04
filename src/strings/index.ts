import en from './en-GB.json';
import fr from './fr-FR.json';

export type MessageId = keyof typeof en;

export const translations: Record<string, Record<MessageId, string>> = {
    'en-GB': en,
    'fr-FR': fr,
};
