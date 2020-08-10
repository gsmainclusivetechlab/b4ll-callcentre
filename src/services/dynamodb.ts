import AWS from 'aws-sdk';
import * as t from 'io-ts';
import { either } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';

const RecordType = t.intersection([
    // required properties
    t.type({
        id: t.string,
    }),
    // optional properties
    t.partial({
        count: t.number,
        recordingUrl: t.string,
    }),
]);
export type RecordType = t.TypeOf<typeof RecordType>;

const getClient = () =>
    new AWS.DynamoDB.DocumentClient({
        endpoint: process.env.DYNAMO_HOST,
        region: process.env.AWS_REGION || 'eu-west-2',
    });

export function getItem(id: string): Promise<RecordType> {
    return getClient()
        .get({
            TableName: process.env.TABLE_NAME || '',
            Key: {
                id,
            },
        })
        .promise()
        .then(({ Item }) =>
            pipe(
                Item,
                RecordType.decode,
                // TODO: for now, I'm ignoring decoding errors on the assumption it's just an empty record
                either.getOrElse(() => ({ id }))
            )
        );
}

export async function putItem(Item: RecordType): Promise<RecordType> {
    if (RecordType.is(Item)) {
        await getClient()
            .put({
                Item,
                TableName: process.env.TABLE_NAME || '',
            })
            .promise();
        return Item;
    }
    return Promise.reject(new Error('Invalid record structure'));
}
