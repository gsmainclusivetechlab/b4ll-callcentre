import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';

// Create a variable to indicate the account statuts

export const get = safeHandle(
    async (request) => {
        const response = new twiml.VoiceResponse();
        const { language, user } = request;
        const active = request.user.isActive;

        if (active) {
            //Verification
            (user.isActive = false),
                response.say(
                    getVoiceParams(language),
                    __('deactivate-account', language)
                );
        } else {
            //Insert a message if for any reason the flow gets here and the account is deactivated
        }

        response.hangup();
        return response;
    },
    { requireVerification: true }
);
