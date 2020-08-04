import AWS from 'aws-sdk';

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
        .then(({ Item }) => Item || {});
}

export async function putItem(
    id: string,
    count: number
): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> {
    return getClient()
        .put({
            TableName: process.env.TABLE_NAME || '',
            Item: {
                id,
                count: count,
            },
        })
        .promise();
}
