import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { MenuOption, menuToGather, menuToHandler } from '../../services/menu';

async function addPassphraseHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./passphrase`);
    return response;
}

async function returnHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./menu`);
    return response;
}

const passphraseMenu: MenuOption[] = [
    {
        triggers: ['add', 'additional', 'add phrase'],
        description: 'passphrase-welcome',
        handler: addPassphraseHandler,
    },
    {
        triggers: ['return'],
        description: 'return-menu',
        handler: returnHandler,
    },
];

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();

        menuToGather(response, request, passphraseMenu);

        // if the gather doesn't detect anything, we fall back on this next instruction:
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, `./passphrase`);
        return response;
    },
    { requireVerification: false }
);

export const post = safeHandle(
    async (request) => {
        return menuToHandler(passphraseMenu, request, `./passphrase`);
    },
    {
        requireVerification: false,
        loginRedirect: { method: 'GET', target: './passphrase' },
    }
);
