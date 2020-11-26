import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../../../services/strings';
import { safeHandle } from '../../../../../services/safeHandle';
import querystring from 'querystring';
import { putAccountItem } from '../../../../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { language, user } = request;
        const { Digits } = querystring.parse(request.event.body || '');
        const answer = Digits || null;

        if (typeof answer === 'string' && answer.length === 1) {
            switch (answer) {
                case '1': {
                    if (user.balanceAmount) {
                        if (user.balanceAmount >= 50) {
                            user.balanceAmount -= 50;
                            await putAccountItem({
                                ...user,
                                balanceAmount: user.balanceAmount,
                            });
                            response.say(
                                getVoiceParams(request.language),
                                __('bill-payment-approved', request.language)
                            );
                        } else {
                            response.say(
                                getVoiceParams(request.language),
                                __(
                                    'bill-payment-invalid-value',
                                    request.language
                                )
                            );
                        }
                    } else {
                        response.say(
                            getVoiceParams(request.language),
                            __(
                                'error',
                                { error: 'user has no balance' },
                                request.language
                            )
                        );
                    }
                    response.redirect({ method: 'GET' }, `/${language}/return`);
                    break;
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
