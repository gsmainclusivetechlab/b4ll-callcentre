import { getItem, putItem, RecordType, getClient } from './dynamodb';

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
        await expect(putItem({ id: 'foo', isEnrolled: true })).resolves.toEqual(
            {
                id: 'foo',
                isEnrolled: true,
            }
        );
        await expect(getItem('foo')).resolves.toEqual({
            id: 'foo',
            isEnrolled: true,
        });
    });

    test('reads dynamo host from environment', async () => {
        process.env.DYNAMO_HOST = undefined;
        process.env.AWS_REGION = 'eu-west-2';
        expect(getClient()).toMatchObject({
            service: {
                config: { endpoint: 'dynamodb.eu-west-2.amazonaws.com' },
            },
        });
    });

    test('reads table name from environment', async () => {
        process.env.TABLE_ACCOUNTS = undefined;
        await expect(getItem('foo')).rejects.toMatchObject({
            message: expect.stringContaining('Invalid table/index name.'),
        });
        await expect(putItem({ id: 'foo' })).rejects.toMatchObject({
            message: expect.stringContaining('Invalid table/index name.'),
        });
    });

    test('rejects invalid items', async () => {
        process.env.TABLE_ACCOUNTS = undefined;
        await expect(putItem(({} as unknown) as RecordType)).rejects.toThrow(
            `Invalid record structure`
        );
    });
});
