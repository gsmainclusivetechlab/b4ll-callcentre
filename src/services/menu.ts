import { twiml } from 'twilio';
import { getVoiceParams, __ } from './strings';
import { ParsedRequest } from './safeHandle';
import querystring from 'querystring';
import { MessageId } from '../strings';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';

export interface MenuOption {
    triggers: string[];
    description: MessageId | ((r: ParsedRequest) => Promise<MessageId>);
    handler: (r: ParsedRequest) => Promise<VoiceResponse>;
}

export async function menuToHandler(
    menu: MenuOption[],
    { event, language, user, auth }: ParsedRequest,
    redirect?: string
): Promise<VoiceResponse> {
    const { Digits, SpeechResult } = querystring.parse(event.body || '');
    const answer = Digits || SpeechResult || null;
    if (typeof answer === 'string') {
        const selected = menu.find(
            (option, i) =>
                answer === '' + (i + 1) || option.triggers.indexOf(answer) >= 0
        );
        if (selected) {
            return selected.handler({ language, user, event, auth });
        }
    }

    // redirect to root and we can try again
    const response = new twiml.VoiceResponse();
    response.say(getVoiceParams(language), __('did-not-understand', language));
    if (redirect) response.redirect({ method: 'GET' }, redirect);
    return response;
}

export async function menuToGather(
    response: VoiceResponse,
    request: ParsedRequest,
    menu: MenuOption[]
): Promise<VoiceResponse.Gather> {
    const voice = getVoiceParams(request.language);
    const gather = response.gather({
        input: ['dtmf'],
        method: 'POST',
        language: voice.language,
        hints: menu.flatMap((o) => o.triggers).join(','),
        numDigits: 1,
        timeout: 5,
    });

    // TODO: consider better behaviour in empty menu case and > 9 items case
    for (let i = 0; i < Math.min(menu.length, 9); i++) {
        const { description: maybeDesc } = menu[i];
        const description: MessageId =
            typeof maybeDesc === 'string'
                ? maybeDesc
                : await maybeDesc(request);
        gather.say(voice, __(description, { index: i + 1 }, request.language));
    }

    return gather;
}
