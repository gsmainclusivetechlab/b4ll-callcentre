import {
    APIGatewayProxyHandlerV2,
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Context,
} from 'aws-lambda';

export function wrapHandlerFn(
    handler: APIGatewayProxyHandlerV2
): (
    props: Partial<APIGatewayProxyEventV2>
) => void | Promise<APIGatewayProxyResultV2> {
    return (props) =>
        handler(
            props as APIGatewayProxyEventV2,
            {} as Context,
            () => ({})
        );
}
