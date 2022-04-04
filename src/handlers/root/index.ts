import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import qs from 'querystring';
import { getApprovedUserItem, putAccountItem } from '../../services/dynamodb';

export const get = safeHandle(async (request) => {
    const { language, user, event } = request;

    const response = new twiml.VoiceResponse();

    if (process.env.APPENV !== 'development' && language !== 'en-DEV') {
        const approvedCaller = await getApprovedUserItem(user.id);

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
    enum msgType {
        SMS,
        USSD,
    }

    async function hasOnlyDigits(value: string) {
        return /^\d+$/.test(value);
    }

    console.log(Caller, message);

    async function resetPINHandler() {
        console.log('resetpinHandler');
        const response = new twiml.MessagingResponse();
        response.redirect({ method: 'GET' }, `./${language}/sms/reset-pin`);
        return response;
    }

    async function merchantHandler(arr: Array<string>, type: number) {
        console.log('merchantHandler');
        const response = new twiml.MessagingResponse();

        if (type === msgType.USSD) {
            arr = arr[0].split('*').filter(Boolean);
        }
        const amount = arr[2];
        const merchantCode = arr[1];

        await putAccountItem({
            ...user,
            transferValue: +amount,
            transferAccount: merchantCode,
        });
        response.redirect({ method: 'GET' }, `./${language}/sms/agent`);
        console.log('end of merchant', amount, merchantCode);

        return response;
    }

    const response = new twiml.MessagingResponse();

    // Not enrolled
    if (!user.isEnrolled) {
        response.message(__('sms-unregistered', language));
        return response;
    }

    if (typeof message === 'string') {
        let finalResponse;

        const reg = /\*(160(\*12345)+)\*[0-9]+\*#/i; // regex for merchant ussd
        const term = message.toLowerCase(); // e.g "resetpin" "*160*12345*10*#"
        const arr = term.split(/\s+/).filter(Boolean);
        if (arr[0][0] === '*') {
            // USSD code
            if (term === '*104#') {
                finalResponse = await resetPINHandler();
                return finalResponse;
            }
            if (reg.test(term)) {
                finalResponse = await merchantHandler(arr, msgType.USSD);
                console.log('after merchantHandler ussd');
                return finalResponse;
            }
            response.message(__('ussd-did-not-understand', language));
            return response;
        } else {
            // SMS code
            if (arr[0] == 'resetpin') {
                finalResponse = await resetPINHandler();
                return finalResponse;
            }
            if (arr[0] == 'merchantpay') {
                if (arr[1] == '12345') {
                    if (await hasOnlyDigits(arr[2])) {
                        finalResponse = await merchantHandler(arr, msgType.SMS);
                        console.log('after merchantHandler');
                        return finalResponse;
                    } else {
                        response.message(__('sms-amount-error', language));
                        return response;
                    }
                } else {
                    response.message(__('sms-merchant-error', language));
                    return response;
                }
            }
            response.message(__('sms-did-not-understand', language));
            return response;
        }
    }
    return response;
});
