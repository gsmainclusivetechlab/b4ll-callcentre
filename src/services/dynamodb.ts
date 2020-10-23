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
        voiceItId: t.string,
        isEnrolled: t.boolean,
        balanceAmount: t.number,
        enrolmentRequest: t.UnknownRecord,
        isDeactivated: t.boolean,
    }),
]);
export type RecordType = t.TypeOf<typeof RecordType>;

export const getClient = (): AWS.DynamoDB.DocumentClient =>
    new AWS.DynamoDB.DocumentClient(
        process.env.DYNAMO_HOST
            ? {
                  // we only provide a host on a local dynamodb, and it needs _something_ as access key
                  endpoint: process.env.DYNAMO_HOST,
                  accessKeyId: 'fake-id',
                  secretAccessKey: 'fake-key',
                  region: 'eu-west-2',
              }
            : {}
    );

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
