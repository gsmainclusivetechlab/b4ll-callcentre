import { twiml } from 'twilio';
import { safeHandle_test } from '../../../../services/safeHandle';

export const get = safeHandle_test(
    async () => {
        const response = new twiml.VoiceResponse();
        response.redirect({ method: 'GET' }, './final');
        return response;
    },
    {
        addPassphrase: true,
        loginRedirect: { method: 'GET', target: '../../passphrase' },
    }
);
