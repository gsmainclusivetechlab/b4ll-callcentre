import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const paymentValue = 50;
        const paymentValue2 = 150;
        const response = new twiml.VoiceResponse();
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string' && answer.length === 5) {
            if (answer === '12345' || answer === '54321') {
                response.say(
                    getVoiceParams(request.language),
                    __(
                        'bill-payment-number',
                        { payment: answer.split('').join(' ') },
                        request.language
                    )
                );
            } else {
                response.say(
                    getVoiceParams(request.language),
                    __('bill-payment-error', request.language)
                );
                response.redirect({ method: 'GET' }, `../../return`);
            }
            // 12345 = happy flow
            if (answer === '12345') {
                const gather = response.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                    action: 'account-number/confirmation',
                });
                gather.say(
                    getVoiceParams(request.language),
                    __(
                        'bill-payment-value',
                        { paymentValue: paymentValue },
                        request.language
                    )
                );
            }
            // 54321 = unhappy flow
            if (answer === '54321') {
                const gather = response.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                });
                gather.say(
                    getVoiceParams(request.language),
                    __(
                        'bill-payment-value',
                        { paymentValue: paymentValue2 },
                        request.language
                    )
                );
            }
        } else if (
            typeof answer === 'string' &&
            answer.length === 1 &&
            answer === '1'
        ) {
            response.say(
                getVoiceParams(request.language),
                __('bill-payment-invalid-value', request.language)
            );
            response.redirect({ method: 'GET' }, `../../return`);
        } else {
            response.say(
                getVoiceParams(request.language),
                __('bill-payment-error', request.language)
            );
            response.redirect({ method: 'GET' }, `../../return`);
        }
        return response;
    },
    {
        requireVerification: false,
    }
);
