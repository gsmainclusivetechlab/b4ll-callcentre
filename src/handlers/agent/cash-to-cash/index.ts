import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { user, language } = request;
        const transferAmount = user.transferValue;

        if (typeof transferAmount === 'number') {
            if (user.balanceAmount) {
                if (user.balanceAmount >= transferAmount) {
                    const gather = response.gather({
                        input: ['dtmf'],
                        numDigits: 1,
                        action: 'cash-to-cash/confirmation',
                    });
                    gather.say(
                        getVoiceParams(language),
                        __(
                            'cash-to-cash-confirmation',
                            {
                                value: transferAmount,
                                account: user.transferAccount
                                    ?.split('')
                                    .join(' '),
                            },
                            language
                        )
                    );

                    // If the user doesn't enter input, loop
                    response.say(
                        getVoiceParams(language),
                        __('did-not-understand', language)
                    );
                    response.redirect(
                        { method: 'GET' },
                        '../agent/cash-to-cash'
                    );
                    return response;
                } else {
                    response.say(
                        getVoiceParams(language),
                        __('transfer-account-invalid-value', language)
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
                __('cash-to-cash-value-error', language)
            );
            response.hangup();
        }
        return response;
    },
    {
        requireVerification: true,
    }
);
