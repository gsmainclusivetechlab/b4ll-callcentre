/**
===================================================================================================================
                                                Reset Pin New Handler

 * POST  = gets new pin from caller/sms/ussd, validates and saves new PIN in DB. redirects to confirmation
 
===================================================================================================================
*/
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import querystring from 'querystring';
import { putAccountItem } from '../../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const { language, user } = request;
        const response = new twiml.VoiceResponse();
        const { Digits } = querystring.parse(request.event.body || '');

        if (typeof Digits === 'string' && Digits.length == 4) {
            if (user.pinNumber) {
                await putAccountItem({
                    ...user,
                    pinNumber: +Digits,
                });
                response.say(
                    getVoiceParams(language),
                    __('reset-pin-new-successful', language)
                );
                response.redirect(
                    { method: 'GET' },
                    `../../${language}/sms/confirmation/reset-pin`
                );
            } else {
                throw new Error('no pin number');
            }
        } else {
            response.say(
                getVoiceParams(language),
                __('reset-pin-new-unsuccessful', language)
            );
            response.redirect({ method: 'GET' }, `../reset-pin/current`);
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '../reset-pin/current');
        return response;
    },
    { requireVerification: true }
);
