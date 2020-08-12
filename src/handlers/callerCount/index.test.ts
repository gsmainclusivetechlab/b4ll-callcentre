import * as orig from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';

const get = mockHandlerFn(orig.get);

describe('Caller count', () => {
    it('should return well-formed XML', async () => {
        const result = await get({
            language: 'en-DEV',
            user: { id: '+77-caller-test' },
        });
        expect(result.toString()).toMatchSnapshot();
    });
});
