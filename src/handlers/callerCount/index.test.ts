import * as orig from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';

const get = mockHandlerFn(orig.get);

describe('Caller count', () => {
    it('should return well-formed XML', async () => {
        const result = await get({
            language: 'en-GB',
            user: { id: '+77-caller-test' },
        });
        expect(result.toString()).toMatchSnapshot();
    });

    it('should increment caller count', async () => {
        const result = await get({
            language: 'en-GB',
            user: { id: '+77-caller-test', count: 1 },
        });
        expect(result.toString()).toMatchSnapshot();
    });
});
