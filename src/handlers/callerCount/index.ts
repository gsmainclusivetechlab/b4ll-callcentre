import { putItem } from '../../services/dynamodb';
import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';

export const get = safeHandle(async ({ language, user }) => {
    user = await putItem({ ...user, count: (user.count || 0) + 1 });

    const response = new twiml.VoiceResponse();
    response.say(
        getVoiceParams(language),
        __('caller-count', { count: user.count }, language)
    );

    return response;
});
