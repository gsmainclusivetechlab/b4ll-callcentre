import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import qs from 'querystring';
import { getApprovedUserItem } from '../../services/dynamodb';

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
