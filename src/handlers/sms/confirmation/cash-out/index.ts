import twilio, { twiml } from 'twilio';
import { safeHandle } from '../../../../services/safeHandle';
import { __ } from '../../../../services/strings';
import qs from 'qs';

export const get = safeHandle(async (request) => {
    const { language, user, event } = request;
    const Caller = user.id;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioClient = twilio(accountSid, authToken);

    const body = qs.parse(event.body || '');
    let From = body['From'] || event.queryStringParameters?.['From'];

    if (!From) {
        const numbers = await twilioClient.incomingPhoneNumbers.list({
            phoneNumber: '+447',
            limit: 1,
        });
        if (!numbers[0])
            throw new Error(
                'Could not find a corresponding number to call from'
            );
        From = numbers[0].phoneNumber;
    }

    await twilioClient.messages.create({
        body: __('sms-confirmation-cash-out', language),
        from: From as string,
        to: Caller,
    });

    const response = new twiml.VoiceResponse();

    response.hangup();

    return response;
});

export const post = safeHandle(async (request) => {
    const { language, user, event } = request;
    const Caller = user.id;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioClient = twilio(accountSid, authToken);

    const body = qs.parse(event.body || '');
    let From = body['From'] || event.queryStringParameters?.['From'];

    if (!From) {
        const numbers = await twilioClient.incomingPhoneNumbers.list({
            phoneNumber: '+447',
            limit: 1,
        });
        if (!numbers[0])
            throw new Error(
                'Could not find a corresponding number to call from'
            );
        From = numbers[0].phoneNumber;
    }

    await twilioClient.messages.create({
        body: __('sms-rejection-cash-out', language),
        from: From as string,
        to: Caller,
    });

    const response = new twiml.VoiceResponse();

    response.hangup();

    return response;
});
