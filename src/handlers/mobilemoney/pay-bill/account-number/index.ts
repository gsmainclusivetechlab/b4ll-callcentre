import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const paymentValue = '$50';
        const paymentValue2 = '$150';
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
            if (answer === '12345') {
                const gather = response.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                    action: 'account-number/confirmation',
                });
                gather.say(
                    getVoiceParams(request.language),
                    __('bill-payment-value', { paymentValue }, request.language)
                );
            }
            if (answer === '54321') {
                const gather = response.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                    action: 'account-number/confirmation',
                });
                gather.say(
                    getVoiceParams(request.language),
                    __(
                        'bill-payment-value',
                        { paymentValue2 },
                        request.language
                    )
                );
            }
        }
        return response;
    },
    {
        requireVerification: false,
    }
);
