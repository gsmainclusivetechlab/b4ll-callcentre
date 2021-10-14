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
                        numDigits: 4,
                        action: `new`,
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
                    response.redirect({ method: 'GET' }, '../reset-pin');
                }
            } else {
                throw new Error('no current pin number');
            }
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '../reset-pin');
        return response;
    },
    { requireVerification: true }
);