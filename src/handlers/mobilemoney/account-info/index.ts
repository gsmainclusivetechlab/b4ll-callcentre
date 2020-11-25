import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import { putAccountItem } from '../../../services/dynamodb';

export const get = safeHandle(
    async (request) => {
        const { language, user } = request;
        const balance = user.balanceAmount;
        const response = new twiml.VoiceResponse();

        if (balance === 0) {
            response.say(
                getVoiceParams(language),
                __('balance-reset', language)
            );
            await putAccountItem({
                ...user,
                balanceAmount: 100,
            });
        }

        response.say(
            getVoiceParams(language),
            __('mobile-money-info', { balance }, language)
        );

        response.redirect({ method: 'GET' }, `../return`);
        return response;
    },
    { requireVerification: true }
);
