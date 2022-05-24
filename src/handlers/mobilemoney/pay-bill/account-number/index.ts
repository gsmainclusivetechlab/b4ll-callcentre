/**
===================================================================================================================
                                                Pay a bill Handler

 * POST = validates account number, asks confirmation to caller & redirects to either /50-confirmation or /150-confirmation
 
===================================================================================================================
*/
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const paymentValue = 50;
        const paymentValue2 = 150;
        const response = new twiml.VoiceResponse();
        const { language } = request;
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer == 'string' && answer.length == 5) {
            switch (answer) {
                case '54321': {
                    response.say(
                        getVoiceParams(request.language),
                        __(
                            'bill-payment-number',
                            { payment: answer.split('').join(' ') },
                            request.language
                        )
                    );
                    const gather = response.gather({
                        input: ['dtmf'],
                        numDigits: 1,
                        action: 'account-number/150-confirmation',
                    });
                    gather.say(
                        getVoiceParams(request.language),
                        __(
                            'bill-payment-value',
                            { paymentValue: paymentValue2 },
                            request.language
                        )
                    );
                    break;
                }
                default: {
                    response.say(
                        getVoiceParams(request.language),
                        __(
                            'bill-payment-number',
                            { payment: answer.split('').join(' ') },
                            request.language
                        )
                    );
                    const gather = response.gather({
                        input: ['dtmf'],
                        numDigits: 1,
                        action: 'account-number/50-confirmation',
                    });
                    gather.say(
                        getVoiceParams(request.language),
                        __(
                            'bill-payment-value',
                            { paymentValue: paymentValue },
                            request.language
                        )
                    );
                    break;
                }
            }
        } else {
            response.say(
                getVoiceParams(request.language),
                __('bill-payment-error', request.language)
            );
            response.redirect({ method: 'GET' }, `../pay-bill`);
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '../pay-bill');
        return response;
    },
    {
        requireVerification: false,
    }
);
