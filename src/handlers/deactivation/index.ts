import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { putAccountItem } from '../../services/dynamodb';

export const get = safeHandle(
    async (request) => {
        const { language, user } = request;
        const response = new twiml.VoiceResponse();

        if (user.isDeactivated) {
            response.say(getVoiceParams(language), __('error', language));
            response.redirect({ method: 'GET' }, `./menu`);
        } else {
            await putAccountItem({
                ...user,
                isDeactivated: true,
            });
            response.say(
                getVoiceParams(language),
                __('deactivate-account', language)
            );
            response.pause({ length: 5 });
            response.redirect({ method: 'GET' }, './survey');
        }

        return response;
    },
    { requireVerification: true }
);
