/**
===================================================================================================================
                                                SMS Agent Cash-In Handler

 * GET  = checks if request from webpage/ivr call, redirects to POST
 * POST = redirects to agent/cash-in
 
===================================================================================================================
*/
import twilio, { twiml } from 'twilio';
import {
    SupportedLanguage,
    getVoiceParams,
    __,
} from '../../../../services/strings';
import { BaseError, safeHandle } from '../../../../services/safeHandle';
import { VerificationState } from '../../../../services/auth';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiHost = process.env.API_HOST;

const twilioClient = twilio(accountSid, authToken);
const prefixByLanguage = (language: SupportedLanguage) => {
    switch (language) {
        case 'en-DEV':
        case 'fr-FR':
        case 'en-GB':
            return '+44';
    }
};

export const get = safeHandle(async ({ language, user, auth, event }) => {
    if (auth.state !== VerificationState.REGISTERED) {
        const err = new BaseError(500, __('alert-unregistered', language));
        throw err;
    }
    const message = new twiml.VoiceResponse();
    const ivrNumber = event.queryStringParameters?.To;
    const cashInAmount = user.transferValue;

    message.say(
        getVoiceParams(language),
        __('sms-agent-cash-in-welcome', { amount: cashInAmount }, language)
    );
    message.redirect(
        { method: 'POST' },
        `${apiHost}${language}/sms/agent/cash-in`
    );

    if (!ivrNumber) {
        const numbers = await twilioClient.incomingPhoneNumbers.list({
            phoneNumber: '+447',
            limit: 1,
        });
        if (!numbers[0])
            throw new Error(
                'Could not find a corresponding number to call from'
            );

        await twilioClient.calls.create({
            twiml: message.toString(),
            to: user.id,
            from: numbers[0].phoneNumber,
        });
    } else {
        // TODO: pick a phone number in a region that matches the user's
        const numbers = await twilioClient.incomingPhoneNumbers.list({
            phoneNumber: prefixByLanguage(language),
        });

        const twilioNumber = numbers.find((i) => i.phoneNumber === ivrNumber);

        console.log(ivrNumber, twilioNumber);

        if (!twilioNumber)
            throw new Error(
                'Could not find a corresponding number to call from'
            );

        await twilioClient.calls.create({
            twiml: message.toString(),
            to: user.id,
            from: twilioNumber.phoneNumber,
        });
    }

    return message;
});

export const post = safeHandle(
    async ({ language }) => {
        const message = new twiml.VoiceResponse();
        message.redirect(
            { method: 'GET' },
            `${apiHost}${language}/agent/cash-in`
        );
        return message;
    },
    {
        allowEnrolment: false,
        requireVerification: false,
        allowDeactivated: false,
    }
);
