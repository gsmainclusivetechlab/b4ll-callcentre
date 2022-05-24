/**
===================================================================================================================
                                                Account Balance Handler

 * GET = informs caller of current balance, resets balance to 100 if below 10
 
===================================================================================================================
*/
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import { putAccountItem } from '../../../services/dynamodb';

export const get = safeHandle(
    async (request) => {
        const { language, user } = request;
        const balance = user.balanceAmount;
        const response = new twiml.VoiceResponse();

        if (!balance || balance <= 10) {
            response.say(
                getVoiceParams(language),
                __('balance-reset', language)
            );
            await putAccountItem({
                ...user,
                balanceAmount: 100,
            });
            response.redirect({ method: 'GET' }, `../return`);
            return response;
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
