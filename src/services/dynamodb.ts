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
        transferValue: t.number,
        transferAccount: t.string,
    }),
]);

const SurveyResponseType = t.intersection([
    // required properties
    t.type({
        id: t.string,
    }),
    // optional properties
    t.partial({
        questions: t.array(t.number),
        countryCode: t.string,
    }),
]);

const ApprovedUsersType = t.intersection([
    // required properties
    t.type({
        id: t.string,
    }),
    t.partial({
        countryCode: t.string,
    }),
]);

export type RecordType = t.TypeOf<typeof RecordType>;
export type SurveyResponseType = t.TypeOf<typeof SurveyResponseType>;
export type ApprovedUsersType = t.TypeOf<typeof ApprovedUsersType>;

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

export function getAccountItem(id: string): Promise<RecordType> {
    return getClient()
        .get({
            TableName: process.env.TABLE_ACCOUNTS || '',
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

export async function putAccountItem(Item: RecordType): Promise<RecordType> {
    if (RecordType.is(Item)) {
        await getClient()
            .put({
                Item,
                TableName: process.env.TABLE_ACCOUNTS || '',
            })
            .promise();
        return Item;
    }
    return Promise.reject(new Error('Invalid record structure'));
}

export function getSurveyItem(id: string): Promise<SurveyResponseType> {
    return getClient()
        .get({
            TableName: process.env.TABLE_SURVEY || '',
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

export async function putSurveyItem(
    Item: SurveyResponseType
): Promise<SurveyResponseType> {
    if (RecordType.is(Item)) {
        await getClient()
            .put({
                Item,
                TableName: process.env.TABLE_SURVEY || '',
            })
            .promise();
        return Item;
    }
    return Promise.reject(new Error('Invalid record structure'));
}

export async function getApprovedUserItem(id: string) {
    return getClient()
        .get({
            TableName: process.env.TABLE_APPROVED || '',
            Key: {
                id,
            },
        })
        .promise();
}

export async function putApprovedUserItem(
    Item: ApprovedUsersType
): Promise<ApprovedUsersType> {
    if (RecordType.is(Item)) {
        await getClient()
            .put({
                Item,
                TableName: process.env.TABLE_APPROVED || '',
            })
            .promise();
        return Item;
    }
    return Promise.reject(new Error('Invalid record structure'));
}
