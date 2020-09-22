import { twiml } from 'twilio';
import { getVoiceParams, __ } from '../../../services/strings';
import { safeHandle } from '../../../services/safeHandle';
import {
    MenuOption,
    menuToHandler,
    menuToGather,
} from '../../../services/menu';

async function accountInformationHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, `../mobilemoney/account-info`);
    return response;
}

async function payBillHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, './mobilemoney/pay-bill');
    return response;
}

async function transferHandler() {
    const response = new twiml.VoiceResponse();
    response.redirect({ method: 'GET' }, './mobilemoney');
    return response;
}

const mobileMoneyMenu: MenuOption[] = [
    {
        triggers: ['account information', 'account', 'information'],
        description: 'mobile-money-prompt',
        handler: accountInformationHandler,
    },
    {
        triggers: ['pay bill', 'pay', 'bill'],
        description: 'pay-bill',
        handler: payBillHandler,
    },
    {
        triggers: ['make transfer', 'transfer'],
        description: 'transfer',
        handler: transferHandler,
    },
];

export const get = safeHandle(
    async (request) => {
        const { language } = request;

        const response = new twiml.VoiceResponse();

        menuToGather(response, request, mobileMoneyMenu);

        // if the gather doesn't detect anything, we fall back on this next instruction:
        response.say(
            getVoiceParams(language),
            __('did-not-understand', language)
        );
        response.redirect({ method: 'GET' }, `./mobilemoney`);
        return response;
    },
    { requireVerification: false }
);

export const post = safeHandle(
    async (request) => {
        return menuToHandler(mobileMoneyMenu, request, `./menu`);
    },
    {
        requireVerification: false,
    }
);
