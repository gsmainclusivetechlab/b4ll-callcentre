import { twiml } from 'twilio';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        response.redirect({ method: 'GET' }, `../passphrase`);
        return response;
    },
    {
        addVerification: true,
        loginRedirect: { method: 'GET', target: './add' },
    }
);
