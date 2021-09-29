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
                response.redirect({ method: 'GET' }, `../return`);
            } else {
                throw new Error('no pin number');
            }
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '/reset-pin');
        return response;
    },
    { requireVerification: true }
);
