import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { getItem, putItem } from '../../services/dynamodb';
import { twiml } from 'twilio';

export const handler: APIGatewayProxyHandlerV2 = async () => {
    const response = new twiml.VoiceResponse();

    try {
        const name = "twilio";
        const getResult = await getItem(name);
        const count = (getResult.Item?.count || 0) + 1;
        await putItem(name, count);
        response.say(`Hello there! You are caller number ${count}`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/xml'
            },
            body: response.toString(),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify(err, null, 2),
        };
    }
};
