import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle, ParsedRequest } from '../../services/safeHandle';
import { MenuOption, menuToHandler, menuToGather } from '../../services/menu';

async function notImplementedHandler({ language }: ParsedRequest) {
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('not-implemented', language));
    response.redirect({ method: 'GET' }, `./menu`);
    return response;
}

const menu: MenuOption[] = [
    {
        triggers: ['mobile money', 'money'],
        description: 'mobile-money-prompt',
        handler: notImplementedHandler,
    },
    {
        triggers: ['bill', 'pay', 'pay bill'],
        description: 'bill-prompt',
        handler: notImplementedHandler,
    },
    {
        triggers: ['update', 'account', 'update account'],
        description: 'account-prompt',
        handler: notImplementedHandler,
    },
];

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();

        menuToGather(response, request, menu);

        // if the gather doesn't detect anything, we fall back on this next instruction:
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, `./menu`);
        return response;
    },
    { requireVerification: true }
);

export const post = safeHandle(
    async (request) => {
        return menuToHandler(menu, request, `./menu`);
    },
    {
        requireVerification: true,
        loginRedirect: { method: 'GET', target: './menu' },
    }
);
