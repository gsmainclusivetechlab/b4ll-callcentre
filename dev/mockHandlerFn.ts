import {
    APIGatewayProxyHandlerV2,
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Context,
} from 'aws-lambda';

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export function mockHandlerFn(
    handler: APIGatewayProxyHandlerV2
): (
    props: DeepPartial<APIGatewayProxyEventV2>
) => void | Promise<APIGatewayProxyResultV2> {
    return (props) =>
        handler(props as APIGatewayProxyEventV2, {} as Context, jest.fn());
}
