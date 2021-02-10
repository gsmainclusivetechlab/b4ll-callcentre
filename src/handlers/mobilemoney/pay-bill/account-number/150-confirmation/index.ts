import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../../services/strings';
import { safeHandle } from '../../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string' && answer.length === 1) {
            switch (answer) {
                case '1': {
                    response.say(
                        getVoiceParams(request.language),
                        __('bill-payment-invalid-value', request.language)
                    );
                    response.redirect({ method: 'GET' }, `../../../return`);
                    return response;
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
                    response.redirect({ method: 'GET' }, `../../../return`);
                    break;
                }
                default: {
                    response.say(
                        getVoiceParams(request.language),
                        __('did-not-understand', request.language)
                    );
                    response.redirect({ method: 'GET' }, `../../../return`);
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
