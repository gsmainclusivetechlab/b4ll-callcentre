import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { putItem } from '../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const { language, user } = request;
        const response = new twiml.VoiceResponse();

        if (user.isDeactivated) {
            response.say(getVoiceParams(language), __('error', language));
            response.redirect({ method: 'GET' }, `./menu`);
        } else {
            await putItem({
                ...user,
                isDeactivated: true,
            });
            response.say(
                getVoiceParams(language),
                __('deactivate-account', language)
            );
            response.hangup();
        }

        return response;
    },
    { requireVerification: true }
);
