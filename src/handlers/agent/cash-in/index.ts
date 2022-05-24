/**
===================================================================================================================
                                                Agent Cash-In Handler

 * GET  = retrieves transferValue, asks caller for confirmation, redirect to /confirmation
                                                
===================================================================================================================
*/
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';

export const get = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { user, language } = request;
        const cashInAmount = user.transferValue;

        if (typeof cashInAmount === 'number') {
            if (user.balanceAmount) {
                if (user.balanceAmount >= cashInAmount) {
                    const gather = response.gather({
                        input: ['dtmf'],
                        numDigits: 1,
                        action: 'cash-in/confirmation',
                    });
                    gather.say(
                        getVoiceParams(language),
                        __(
                            'cash-in-confirmation',
                            {
                                value: cashInAmount,
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
                    response.redirect({ method: 'GET' }, '../agent/cash-in');
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
                __('cash-in-value-error', language)
            );
            response.hangup();
        }
        return response;
    },
    {
        requireVerification: true,
    }
);
