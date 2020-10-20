import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../../../services/strings';
import { safeHandle } from '../../../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { language } = request;
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string' && answer.length === 1) {
            switch (answer) {
                case '1': {
                    response.say(
                        getVoiceParams(request.language),
                        __('transfer-approved', request.language)
                    );
                    response.redirect({ method: 'GET' }, `/${language}/return`);
                    break;
                }
                case '2': {
                    response.say(
                        getVoiceParams(request.language),
                        __(
                            'transfer-declined',
                            { error: 'cancellation' },
                            request.language
                        )
                    );
                    response.redirect({ method: 'GET' }, `/${language}/return`);
                    break;
                }
                default: {
                    response.say(
                        getVoiceParams(request.language),
                        __('did-not-understand', request.language)
                    );
                    response.redirect({ method: 'GET' }, `/${language}/return`);
                    break;
                }
            }
        } else {
            response.say(
                getVoiceParams(request.language),
                __('did-not-understand', request.language)
            );
            response.redirect({ method: 'GET' }, `/${language}/return`);
        }
        return response;
    },
    {
        requireVerification: false,
    }
);
