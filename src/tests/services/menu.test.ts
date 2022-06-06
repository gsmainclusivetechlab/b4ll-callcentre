import { menuToGather, MenuOption, menuToHandler } from '../../services/menu';
import { twiml } from 'twilio';
import qs from 'querystring';

const mock: MenuOption = {
    triggers: ['record', 'sign up', 'enrol'],
    description: 'test-indexed',
    handler: async () => {
        const response = new twiml.VoiceResponse();
        response.say('menu-selected');
        return response;
    },
};
const descriptionFunction = async () => 'test';

const request = {
    language: 'en-DEV' as const,
    user: { id: '234' },
    auth: {} as never,
    event: {} as never,
};

describe('menuToGather', () => {
    test.each`
        case                      | menu                                               | expectation
        ${'empty menu'}           | ${[]}                                              | ${expect.not.stringContaining('Say')}
        ${'empty triggers'}       | ${[{ ...mock, triggers: [] }]}                     | ${expect.stringContaining('hints=""')}
        ${'description function'} | ${[{ ...mock, description: descriptionFunction }]} | ${expect.stringContaining('test')}
    `('should handle $case', async ({ menu, expectation }) => {
        const response = new twiml.VoiceResponse();
        await menuToGather(response, request, menu);
        expect(response.toString()).toEqual(expectation);
    });

    test('should crop after 9 items', async () => {
        const response = new twiml.VoiceResponse();
        menuToGather(response, request, new Array(12).fill(mock));
        expect(response.toString().match(/test-\d/g)).toEqual([
            'test-1',
            'test-2',
            'test-3',
            'test-4',
            'test-5',
            'test-6',
            'test-7',
            'test-8',
            'test-9',
        ]);
    });
});

describe('menuToHandler', () => {
    test.each`
        case                | menu      | body                                        | message
        ${'selected digit'} | ${[mock]} | ${qs.stringify({ Digits: '1' })}            | ${'menu-selected'}
        ${'spoken item'}    | ${[mock]} | ${qs.stringify({ SpeechResult: 'record' })} | ${'menu-selected'}
        ${'invalid item'}   | ${[mock]} | ${qs.stringify({ Digits: '2' })}            | ${'did-not-understand'}
        ${'empty menu'}     | ${[]}     | ${qs.stringify({ Digits: '1' })}            | ${'did-not-understand'}
        ${'empty body'}     | ${[mock]} | ${qs.stringify({})}                         | ${'did-not-understand'}
    `('handles $case', async ({ menu, message, body }) => {
        const response = await menuToHandler(menu, {
            ...request,
            event: { body } as never,
        });
        expect(response.toString()).toContain(message);
    });

    test('includes redirect when provided', async () => {
        const response = await menuToHandler(
            [],
            request,
            './en-DEV/not-understood'
        );
        expect(response.toString()).toContain('./en-DEV/not-understood');
    });
});
