import { getItem, putItem } from './dynamodb';

describe('dynamodb', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV }; // clone our backup copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // restore old env
    });

    test('fetches items correctly', async () => {
        await expect(getItem('foo')).resolves.toEqual({});
        await expect(putItem('foo', 12)).resolves.toEqual({});
        await expect(getItem('foo')).resolves.toEqual({ id: 'foo', count: 12 });
    });

    test('reads table name from environment', async () => {
        process.env.TABLE_NAME = undefined;
        await expect(getItem('foo')).rejects.toMatchObject({
            message: expect.stringContaining('Invalid table/index name.'),
        });
        await expect(putItem('foo', 12)).rejects.toMatchObject({
            message: expect.stringContaining('Invalid table/index name.'),
        });
    });
});
