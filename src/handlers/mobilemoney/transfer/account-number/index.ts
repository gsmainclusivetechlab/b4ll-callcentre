import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../services/strings';
import { safeHandle } from '../../../../services/safeHandle';
import querystring from 'querystring';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string' && answer.length === 6) {
            if (answer === '112233') {
                response.say(
                    getVoiceParams(request.language),
                    __(
                        'transfer-account-number',
                        { account: answer.split('').join(' ') },
                        request.language
                    )
                );
                const gather = response.gather({
                    input: ['dtmf'],
                    action: 'account-number/amount',
                });
                gather.say(
                    getVoiceParams(request.language),
                    __('transfer-account-value', request.language)
                );
            } else {
                response.say(
                    getVoiceParams(request.language),
                    __('transfer-account-error', request.language)
                );
                response.redirect({ method: 'GET' }, `../../return`);
            }
        }
        return response;
    },
    {
        requireVerification: false,
    }
);
