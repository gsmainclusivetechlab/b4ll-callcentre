import twilio, { twiml } from 'twilio';
import {
    SupportedLanguage,
    getVoiceParams,
    __,
} from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import { VerificationState } from '../../../services/auth';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiHost = process.env.API_HOST;

const twilioClient = twilio(accountSid, authToken);
const prefixByLanguage = (language: SupportedLanguage) => {
    switch (language) {
        case 'en-DEV':
        case 'en-GB':
            return '+44';
        case 'fr-FR':
            return '+33';
    }
};

export const get = safeHandle(async ({ language, user, auth }) => {
    if (auth.state !== VerificationState.REGISTERED) {
        throw {
            statusCode: 500,
            error: __('alert-unregistered', language),
        };
    }
    const message = new twiml.VoiceResponse();
    message.say(getVoiceParams(language), __('sms-agent-welcome', language));
    message.redirect({ method: 'POST' }, `${apiHost}${language}/sms/agent`);

    // TODO: pick a phone number in a region that matches the user's
    const numbers = await twilioClient.incomingPhoneNumbers.list({
        phoneNumber: prefixByLanguage(language),
        limit: 1,
    });
    if (!numbers[0])
        throw new Error('Could not find a corresponding number to call from');

    await twilioClient.calls.create({
        twiml: message.toString(),
        to: user.id,
        from: numbers[0].phoneNumber,
    });

    return message;
});

export const post = safeHandle(
    async ({ language }) => {
        const message = new twiml.VoiceResponse();
        message.redirect(
            { method: 'GET' },
            `${apiHost}${language}/agent/transfer`
        );
        return message;
    },
    {
        allowEnrolment: false,
        requireVerification: false,
        allowDeactivated: false,
    }
);
