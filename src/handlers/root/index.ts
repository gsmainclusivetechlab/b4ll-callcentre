import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getItem, putItem } from '../../services/dynamodb';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const name = event.pathParameters?.name || 'World';
    try {
        const getResult = await getItem(name);
        const count = (getResult.Item?.count || 0) + 1;
        await putItem(name, count);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Hello ${name}`,
                count,
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err, null, 2),
        };
    }
};
