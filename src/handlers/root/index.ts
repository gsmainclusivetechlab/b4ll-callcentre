import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/errors';
import { MenuOption, menuToHandler, menuToGather } from '../../services/menu';
import { putItem } from '../../services/dynamodb';

const fullMenu: MenuOption[] = [
    {
        triggers: ['record', 'sign up', 'enrol'],
        description: 'record-message-prompt',
        handler: async ({ language }) => {
            const response = new twiml.VoiceResponse();
            response.redirect({ method: 'GET' }, `./${language}/record`);
            return response;
        },
    },
    {
        triggers: ['hear', 'listen'],
        description: 'hear-message-prompt',
        handler: async ({ user, language }) => {
            const response = new twiml.VoiceResponse();
            if (user.recordingUrl) {
                response.play(user.recordingUrl);
            }
            response.redirect({ method: 'GET' }, `./${language}/count`);
            return response;
        },
    },
    {
        triggers: ['count'],
        description: 'call-count-prompt',
        handler: async ({ language }) => {
            const response = new twiml.VoiceResponse();
            response.redirect({ method: 'GET' }, `./${language}/count`);
            return response;
        },
    },
];

const unauthedMenu = fullMenu.filter(
    (o) => o.description !== 'hear-message-prompt'
);

export const post = safeHandle(async (request) => {
    const { language, user } = request;
    const menu = user && user.recordingUrl ? fullMenu : unauthedMenu;

    return menuToHandler(menu, request, `./${language}`);
});

export const get = safeHandle(async (request) => {
    const { language, user } = request;

    // update the call count immediately
    await putItem({ ...user, count: (user.count || 0) + 1 });

    const response = new twiml.VoiceResponse();
    let menu;
    if (user && user.recordingUrl) {
        menu = fullMenu;
        response.say(getVoiceParams(language), __('welcome-known', language));
    } else {
        menu = unauthedMenu;
        response.say(
            getVoiceParams(language),
            __('welcome-stranger', language)
        );
    }

    menuToGather(response, request, menu);

    // if the gather doesn't detect anything, we fall back on this next instruction:
    response.say(getVoiceParams(language), __('did-not-understand', language));
    response.redirect({ method: 'GET' }, `./${language}`);
    return response;
});
