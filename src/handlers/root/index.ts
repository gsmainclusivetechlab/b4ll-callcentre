import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import qs from 'querystring';
import { getApprovedUserItem, putAccountItem } from '../../services/dynamodb';

export const get = safeHandle(async (request) => {
    const { language, user, event } = request;
    const body = qs.parse(event.body || '');
    const callerKey =
        body.Direction === 'outbound-api' ||
        event.queryStringParameters?.Direction === 'outbound-api'
            ? 'Called'
            : 'Caller';
    const Caller = body[callerKey] || event.queryStringParameters?.[callerKey];

    console.log(Caller);

    const response = new twiml.VoiceResponse();

    console.log(process.env.APPENV);

    if (process.env.APPENV !== 'development' && language !== 'en-DEV') {
        const approvedCaller = await getApprovedUserItem(user.id);
        console.log(approvedCaller);

        if (approvedCaller.Item == null || approvedCaller.Item == undefined) {
            response.say(
                getVoiceParams(language),
                __('unapproved-caller', language)
            );
            response.hangup();
            return response;
        }
    }

    response.say(getVoiceParams(language), __('welcome-known', language));

    if (user.isDeactivated) {
        response.say(
            getVoiceParams(language),
            __('reactivation-welcome', language)
        );
        response.redirect({ method: 'GET' }, `./${language}/reactivation`);
    } else {
        response.redirect({ method: 'GET' }, `./${language}/menu`);
    }

    return response;
});

export const post = safeHandle(async (request) => {
    const { user, language, event } = request;
    const body = qs.parse(event.body || '');
    const Caller = body['From'];
    const message = body['Body'];

    console.log(Caller, message);

    const response = new twiml.MessagingResponse();

    // Not enrolled
    if (!user.isEnrolled) {
        response.message(__('sms-unregistered', language));
        return response;
    }

    // Enrolled and valid SMS term
    if (typeof message === 'string') {
        const term = message.toLowerCase();
        const arr =
            message[0] === '*'
                ? term.split('*').filter(Boolean)
                : term.split(/\s+/).filter(Boolean);
        console.log(arr);
        if (arr[0] === 'merchantpay' || arr[0] === '12') {
            if (arr[1] === '12345') {
                if (arr[2]) {
                    const amount = arr[2];
                    const merchantCode = arr[1];
                    await putAccountItem({
                        ...user,
                        transferValue: +amount,
                        transferAccount: merchantCode,
                    });
                    response.redirect(
                        { method: 'GET' },
                        `./${language}/sms/agent`
                    );
                } else {
                    response.message(__('sms-amount-error', language));
                }
            } else {
                response.message(__('sms-merchant-error', language));
            }
        } else if (
            arr[0] === 'resetpin' ||
            (arr[0] === '42' && arr[1] === '033')
        ) {
            response.redirect({ method: 'GET' }, `./${language}/sms/reset-pin`);
        } else {
            response.message(__('sms-did-not-understand', language));
        }
    } else {
        response.message(__('sms-did-not-understand', language));
    }
    return response;
});
