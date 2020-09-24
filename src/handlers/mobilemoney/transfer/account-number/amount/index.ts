import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../../services/strings';
import { safeHandle } from '../../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { language } = request;
        const accountNumber = '112233';
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string') {
            if (+answer < 100) {
                const gather = response.gather({
                    input: ['dtmf'],
                    numDigits: 1,
                    action: 'amount/confirmation',
                });
                gather.say(
                    getVoiceParams(request.language),
                    __(
                        'transfer-account-confirmation',
                        {
                            value: +answer,
                            account: accountNumber.split('').join(' '),
                        },
                        request.language
                    )
                );
            } else {
                response.say(
                    getVoiceParams(request.language),
                    __('transfer-account-invalid-value', request.language)
                );
                response.redirect({ method: 'GET' }, `/${language}/return`);
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
