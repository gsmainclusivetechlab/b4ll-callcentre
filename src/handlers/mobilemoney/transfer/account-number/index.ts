import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import querystring from 'querystring';
import { putAccountItem } from '../../../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { language, user } = request;
        const { Digits } = querystring.parse(request.event.body || '');
        const accountNumber = Digits || null;

        if (typeof accountNumber === 'string' && accountNumber.length >= 5) {
            response.say(
                getVoiceParams(request.language),
                __(
                    'transfer-account-number',
                    { account: accountNumber.split('').join(' ') },
                    request.language
                )
            );
            await putAccountItem({
                ...user,
                transferAccount: accountNumber,
            });
            const gather = response.gather({
                input: ['dtmf'],
                action: 'account-number/amount',
            });
            gather.say(
                getVoiceParams(request.language),
                __('transfer-account-value', request.language)
            );
        } else {
            response.say(
                getVoiceParams(request.language),
                __('transfer-account-error', request.language)
            );
            response.redirect({ method: 'GET' }, `../transfer`);
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '../transfer');
        return response;
    },
    {
        requireVerification: false,
    }
);
