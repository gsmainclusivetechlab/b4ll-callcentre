import * as orig from '.';
import { mockHandlerFn } from '../../../dev/mockHandlerFn';

const get = mockHandlerFn(orig.get);

describe('Greeting message', () => {
    it('should return well-formed XML', async () => {
        const result = await get({
            language: 'fr-FR',
            user: { id: '77-root-test' },
        });
        expect(result.toString()).toMatchSnapshot();
    });
});
