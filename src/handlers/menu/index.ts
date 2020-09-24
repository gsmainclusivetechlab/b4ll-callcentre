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

async function mobileMoneyHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, './mobilemoney');
    return response;
}

const menu: MenuOption[] = [
    {
        triggers: ['mobile money', 'money'],
        description: 'mobile-money',
        handler: mobileMoneyHandler,
    },
    {
        triggers: ['alert simulation', 'simulation', 'alert'],
        description: 'alert',
        handler: notImplementedHandler,
    },
    {
        triggers: ['new voice', 'new passphrase', 'passphrase'],
        description: 'passphrase-manager',
        handler: notImplementedHandler,
    },
    {
        triggers: [
            'deactivate',
            'deactivate account',
            'account deactivation',
            'deactivation',
        ],
        description: 'deactivate',
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
    { requireVerification: false }
);

export const post = safeHandle(
    async (request) => {
        return menuToHandler(menu, request, `./menu`);
    },
    {
        requireVerification: false,
        loginRedirect: { method: 'GET', target: './menu' },
    }
);
