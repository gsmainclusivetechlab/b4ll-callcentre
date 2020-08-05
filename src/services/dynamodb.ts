import AWS from 'aws-sdk';

export interface RecordType {
    count?: number;
    recordingUrl?: string;
}

const getClient = () =>
    new AWS.DynamoDB.DocumentClient({
        endpoint: process.env.DYNAMO_HOST,
        region: process.env.AWS_REGION || 'eu-west-2',
    });

export async function getItem(
    id: string
): Promise<AWS.DynamoDB.DocumentClient.AttributeMap> {
    return getClient()
        .get({
            TableName: process.env.TABLE_NAME || '',
            Key: {
                id,
            },
        })
        .promise()
        .then(({ Item }): RecordType => Item || {});
}

export async function putItem(
    id: string,
    data: RecordType
): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> {
    return getClient()
        .put({
            TableName: process.env.TABLE_NAME || '',
            Item: {
                id,
                ...data,
            },
        })
        .promise();
}
