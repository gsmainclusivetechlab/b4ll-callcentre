import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { MenuOption, menuToGather, menuToHandler } from '../../services/menu';

async function changePinHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./reset-pin/change`);
    return response;
}

async function resetPinHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./reset-pin/current`);
    return response;
}

async function returnHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./menu`);
    return response;
}

const pinMenu: MenuOption[] = [
    {
        triggers: ['change', 'change pin'],
        description: 'reset-pin-change',
        handler: changePinHandler,
    },
    {
        triggers: ['reset', 'reset pin'],
        description: 'reset-pin-reset',
        handler: resetPinHandler,
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

        menuToGather(response, request, pinMenu);

        // if the gather doesn't detect anything, we fall back on this next instruction:
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, `./reset-pin`);
        return response;
    },
    { requireVerification: true }
);

export const post = safeHandle(
    async (request) => {
        return menuToHandler(pinMenu, request, `./reset-pin`);
    },
    { requireVerification: true }
);
