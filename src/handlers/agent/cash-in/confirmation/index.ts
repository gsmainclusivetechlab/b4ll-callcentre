/**
===================================================================================================================
                                                Agent Cash-In Conformation Handler

 * POST  = if 1, subtracts transferValue from balance, redirect to sms confirmation. if 2, redirect to sms rejection
                                                
===================================================================================================================
*/
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import querystring from 'querystring';
import { putAccountItem } from '../../../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { user, language } = request;
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string' && answer.length === 1) {
            switch (answer) {
                case '1': {
                    if (user.balanceAmount && user.transferValue) {
                        user.balanceAmount += user.transferValue;
                        await putAccountItem({
                            ...user,
                            balanceAmount: user.balanceAmount,
                        });
                    }
                    response.say(
                        getVoiceParams(request.language),
                        __('cash-in-approved', request.language)
                    );
                    response.redirect(
                        { method: 'GET' },
                        `../../sms/confirmation/cash-in`
                    );
                    return response;
                }
                case '2': {
                    response.say(
                        getVoiceParams(request.language),
                        __(
                            'cash-in-declined',
                            { error: 'cancellation' },
                            request.language
                        )
                    );
                    response.redirect(
                        { method: 'POST' },
                        `../../sms/confirmation/cash-in`
                    );
                    break;
                }
                default: {
                    response.say(
                        getVoiceParams(request.language),
                        __('did-not-understand', request.language)
                    );
                    response.redirect({ method: 'GET' }, `../../cash-in`);
                    break;
                }
            }
        } else {
            response.say(
                getVoiceParams(request.language),
                __('did-not-understand', request.language)
            );
            response.redirect({ method: 'GET' }, `./confirmation)`);
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '../../../cash-in');
        return response;
    },
    {
        requireVerification: false,
    }
);
