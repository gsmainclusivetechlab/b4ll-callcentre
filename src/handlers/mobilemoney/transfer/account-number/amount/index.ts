import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../../services/strings';
import { safeHandle } from '../../../../../services/safeHandle';
import querystring from 'querystring';
import { putAccountItem } from '../../../../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { user, language } = request;
        const accountNumber = '112233';
        const { Digits } = querystring.parse(request.event.body || '');
        const value = Digits || null;

        if (typeof value === 'string') {
            if (user.balanceAmount) {
                if (user.balanceAmount >= +value) {
                    await putAccountItem({
                        ...user,
                        transferValue: +value,
                    });
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
                                value: +value,
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
                    response.redirect({ method: 'GET' }, `../../../return`);
                }
            } else {
                response.say(
                    getVoiceParams(request.language),
                    __(
                        'error',
                        {
                            message:
                                'Your account balance is 0. Please check your balance to reset it.',
                        },
                        request.language
                    )
                );
                response.redirect({ method: 'GET' }, `../../../return`);
            }
        } else {
            response.say(
                getVoiceParams(request.language),
                __('did-not-understand', request.language)
            );
            response.redirect({ method: 'GET' }, `./transfer`);
        }

        // If the user doesn't enter input, loop
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, '../../transfer');
        return response;
    },
    {
        requireVerification: false,
    }
);
