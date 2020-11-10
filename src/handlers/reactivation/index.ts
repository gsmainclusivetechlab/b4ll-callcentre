import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { putItem } from '../../services/dynamodb';

export const get = safeHandle(
    async (request) => {
        const { language, user } = request;
        const response = new twiml.VoiceResponse();

        if (user.isDeactivated) {
            await putItem({
                ...user,
                isDeactivated: false,
            });
            response.say(
                getVoiceParams(language),
                __('reactivation-confirmation', language)
            );
            response.redirect({ method: 'GET' }, `./menu`);
        } else {
            response.say(getVoiceParams(language), __('error', language));
            response.hangup();
        }

        return response;
    },
    { requireVerification: true }
);
