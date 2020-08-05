/* istanbul ignore file */

import {
    Context,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayProxyHandler,
} from 'aws-lambda';

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export function mockHandlerFn(
    handler: APIGatewayProxyHandler
): (
    props: DeepPartial<APIGatewayProxyEvent>
) => Promise<APIGatewayProxyResult> {
    return (props) => {
        const result = handler(
            props as APIGatewayProxyEvent,
            {} as Context,
            jest.fn()
        );
        if (!result) throw new Error('Unexpected void result');
        return result;
    };
}
