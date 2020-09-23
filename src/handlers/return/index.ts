import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../services/strings';
import { safeHandle } from '../../services/safeHandle';
import { MenuOption, menuToHandler, menuToGather } from '../../services/menu';

async function returnMainMenuHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `./menu`);
    return response;
}

async function endCallHandler() {
    const response = new twiml.VoiceResponse();
    response.hangup();
    return response;
}

const returnMenu: MenuOption[] = [
    {
        triggers: ['return'],
        description: 'return-menu',
        handler: returnMainMenuHandler,
    },
    {
        triggers: ['end call'],
        description: 'end-call',
        handler: endCallHandler,
    },
];

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();

        menuToGather(response, request, returnMenu);

        // if the gather doesn't detect anything, we fall back on this next instruction:
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, `./return`);
        return response;
    },
    { requireVerification: false }
);
