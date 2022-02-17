import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const { language, user } = request;
        const response = new twiml.VoiceResponse();
        const { Digits } = querystring.parse(request.event.body || '');

        if (typeof Digits === 'string' && Digits.length == 4) {
            if (user.pinNumber) {
                if (Digits === user.pinNumber.toString()) {
                    const gather = response.gather({
                        input: ['dtmf'],
                        action: `new`,
                        numDigits: 4,
                        finishOnKey: '#',
                    });

                    gather.say(
                        getVoiceParams(language),
                        __('reset-pin-current-successful', language)
                    );
                } else {
                    response.say(
                        getVoiceParams(language),
                        __('reset-pin-current-unsuccessful', language)
                    );
                    response.redirect({ method: 'GET' }, '../reset-pin/change');
                }
            } else {
                throw new Error('no current pin number');
            }
        } else {
            response.say(
                getVoiceParams(language),
                __('reset-pin-current-error', language)
            );
            response.redirect({ method: 'POST' }, '../reset-pin/current');
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'POST' }, '../reset-pin/current');
        return response;
    },
    { requireVerification: true }
);

export const get = safeHandle(
    async (request) => {
        const { language } = request;
        const response = new twiml.VoiceResponse();
        const gather = response.gather({
            input: ['dtmf'],
            numDigits: 4,
            action: `new`,
            finishOnKey: '#',
        });
        gather.say(
            getVoiceParams(language),
            __('reset-pin-current-welcome', language)
        );

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
