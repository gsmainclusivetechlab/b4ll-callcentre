//SUBMENU MOBILE MONEY

import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle, ParsedRequest } from '../../services/safeHandle';
import { MenuOption, menuToHandler, menuToGather } from '../../services/menu';

async function notImplementedHandler({ language }: ParsedRequest) {
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('not-implemented', language));
    response.redirect({ method: 'GET' }, `./mobilemoney`);
    return response;
}

const menu: MenuOption[] = [
    {
        triggers: ['balance'],
        description: 'mobile-money-balance',
        handler: notImplementedHandler,
    },
    {
        triggers: ['alert simulation', 'simulation', 'alert'],
        description: 'pay-bill',
        handler: notImplementedHandler,
    },
    {
        triggers: ['new voice', 'new passphrase', 'passphrase'],
        description: 'transfer',
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
        response.redirect({ method: 'GET' }, `./mobilemoney`);
        return response;
    },
    { requireVerification: true }
);

export const post = safeHandle(
    async (request) => {
        return menuToHandler(menu, request, `./mobilemoney`);
    },
    {
        requireVerification: true,
        loginRedirect: { method: 'GET', target: './mobilemoney' },
    }
);
