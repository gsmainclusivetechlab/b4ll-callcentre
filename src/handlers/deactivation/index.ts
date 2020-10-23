import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { putItem } from '../../services/dynamodb';

export const post = safeHandle(
    async (request) => {
        const { language, user } = request;
        const response = new twiml.VoiceResponse();
        const active = user.isActive;

        // if (!user.isActive) {
        //     throw new Error('You must be active before trying to deactivate your account');
        // }
        // else{

        // }

        await putItem({
            ...user,
            isActive: false,
        });

        response.say(
            getVoiceParams(language),
            __('deactivate-account', { active }, language)
        );
        response.redirect({ method: 'GET' }, `./menu`);

        //user.isActive = false;

        //response.hangup();
        return response;
    },
    { requireVerification: true }
);
