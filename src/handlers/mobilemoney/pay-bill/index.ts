import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import querystring from 'querystring';

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();
    const voice = getVoiceParams(language);

    const gather = response.gather({
        input: ['dtmf'],
        numDigits: 5,
    });

    gather.say(voice, __('bill-payment-message', language));

    // If the user doesn't enter input, loop
    response.redirect('../return');
    return response;
});

export const post = safeHandle(
    async (request) => {
        const paymentValue = '$50';
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
                const gather = response.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                });
                gather.say(
                    getVoiceParams(request.language),
                    __('bill-payment-value', { paymentValue }, request.language)
                );
            } else {
                response.say(
                    getVoiceParams(request.language),
                    __('bill-payment-error', request.language)
                );
                response.redirect({ method: 'GET' }, `../return`);
            }
        }
        if (typeof answer === 'string' && answer.length === 1) {
            switch (answer) {
                case '1': {
                    response.say(
                        getVoiceParams(request.language),
                        __('bill-payment-approved', request.language)
                    );
                    response.redirect({ method: 'GET' }, `../return`);
                    break;
                }
                case '2': {
                    response.say(
                        getVoiceParams(request.language),
                        __(
                            'bill-payment-declined',
                            { error: 'cancellation' },
                            request.language
                        )
                    );
                    response.redirect({ method: 'GET' }, `../return`);
                    break;
                }
                default: {
                    response.say(
                        getVoiceParams(request.language),
                        __('did-not-understand', request.language)
                    );
                    response.redirect({ method: 'GET' }, `../return`);
                    break;
                }
            }
        }

        return response;
    },
    {
        requireVerification: false,
    }
);
