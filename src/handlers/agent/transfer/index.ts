import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { user, language } = request;
        const paymentAmount = user.transferValue;

        if (typeof paymentAmount === 'number') {
            if (user.balanceAmount) {
                if (user.balanceAmount >= paymentAmount) {
                    const gather = response.gather({
                        input: ['dtmf'],
                        numDigits: 1,
                        action: 'transfer/confirmation',
                    });
                    gather.say(
                        getVoiceParams(language),
                        __(
                            'bill-payment-value',
                            {
                                paymentValue: paymentAmount,
                            },
                            language
                        )
                    );

                    // If the user doesn't enter input, loop
                    response.say(
                        getVoiceParams(language),
                        __('did-not-understand', language)
                    );
                    response.redirect({ method: 'GET' }, '../agent/transfer');
                    return response;
                } else {
                    response.say(
                        getVoiceParams(language),
                        __('bill-payment-invalid-value', language)
                    );
                    response.hangup();
                }
            } else {
                response.say(
                    getVoiceParams(language),
                    __(
                        'error',
                        {
                            message:
                                'Your account balance is 0. Please check your balance to reset it.',
                        },
                        language
                    )
                );
                response.hangup();
            }
        } else {
            response.say(
                getVoiceParams(language),
                __('transfer-value-error', language)
            );
            response.hangup();
        }
        return response;
    },
    {
        requireVerification: true,
    }
);
