import { twiml } from 'twilio';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();
        response.redirect({ method: 'GET' }, `/${language}/menu`);

        return response;
    },
    { addVerification: true }
);
