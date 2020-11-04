import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { MenuOption, menuToGather, menuToHandler } from '../../services/menu';

async function addPassphraseHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./passphrase/add`);
    return response;
}

async function returnHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./menu`);
    return response;
}

/*
TODO: I'm not sure if this additional level of menu is useful? If I'm understanding right, 
we are offering the choice to either continue doing what they asked, or go back to the previous menu.
I would think that we could trust the user when they pressed "add passphrase" in the previous menu,
and proceed straight onwards to the actual handler instead of adding this interim menu.
*/
const passphraseMenu: MenuOption[] = [
    {
        triggers: ['add', 'additional', 'add phrase'],
        description: 'passphrase-add',
        handler: addPassphraseHandler,
    },
    {
        triggers: ['return'],
        description: 'return-menu',
        handler: returnHandler,
    },
];

export const get = safeHandle(async (request) => {
    const { language } = request;

    const response = new twiml.VoiceResponse();

    menuToGather(response, request, passphraseMenu);

    // if the gather doesn't detect anything, we fall back on this next instruction:
    response.say(getVoiceParams(language), __('did-not-understand', language));
    response.redirect({ method: 'GET' }, `./passphrase`);
    return response;
});

export const post = safeHandle(async (request) => {
    return menuToHandler(passphraseMenu, request, `./passphrase`);
});
