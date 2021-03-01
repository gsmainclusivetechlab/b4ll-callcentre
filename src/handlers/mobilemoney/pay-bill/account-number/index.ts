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

        switch (answer) {
            case '12345': {
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
                    __('bill-payment-error', request.language)
                );
                response.redirect({ method: 'GET' }, `../pay-bill`);
                break;
            }
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
