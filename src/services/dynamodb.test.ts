import { getItem, putItem, RecordType } from './dynamodb';

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
        await expect(getItem('foo')).resolves.toEqual({ id: 'foo' });
        await expect(putItem({ id: 'foo', count: 12 })).resolves.toEqual({
            id: 'foo',
            count: 12,
        });
        await expect(getItem('foo')).resolves.toEqual({ id: 'foo', count: 12 });
    });

    test('reads table name from environment', async () => {
        process.env.TABLE_NAME = undefined;
        await expect(getItem('foo')).rejects.toMatchObject({
            message: expect.stringContaining('Invalid table/index name.'),
        });
        await expect(putItem({ id: 'foo', count: 12 })).rejects.toMatchObject({
            message: expect.stringContaining('Invalid table/index name.'),
        });
    });

    test('rejects invalid items', async () => {
        process.env.TABLE_NAME = undefined;
        await expect(
            putItem(({ id: 'foo', count: 'fourteen' } as unknown) as RecordType)
        ).rejects.toMatchInlineSnapshot(`[Error: Invalid record structure]`);
    });
});
