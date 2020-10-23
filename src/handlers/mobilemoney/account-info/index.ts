import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const { language } = request;
        const balance = request.user.balanceAmount;
        const response = new twiml.VoiceResponse();

        if (balance === 0) {
            response.say(
                getVoiceParams(language),
                __('balance-reset', language)
            );
        }

        response.say(
            getVoiceParams(language),
            __('mobile-money-info', { balance }, language)
        );

        response.redirect({ method: 'GET' }, `../return`);
        return response;
    },
    { requireVerification: false }
);
