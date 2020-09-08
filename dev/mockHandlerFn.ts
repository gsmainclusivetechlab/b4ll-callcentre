/* istanbul ignore file */

import { safeHandle, ParsedRequest } from '../src/services/safeHandle';

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
type Handler = Parameters<typeof safeHandle>[0];
type TestInput = Omit<ParsedRequest, 'event' | 'auth'> & {
    event?: DeepPartial<ParsedRequest['event']>;
    auth?: ParsedRequest['auth'];
};
type HandlerResult = ReturnType<Handler>;

/**
 * Undoes the effect of the `safeHandle` function, and mocks the event parameter
 * @param handler
 */
export function mockHandlerFn(
    handler: unknown
): (input: TestInput) => HandlerResult {
    if (
        typeof handler === 'function' &&
        handler.name === 'safelyHandledFunction' &&
        'orig' in handler
    ) {
        const orig = (handler as Record<string, unknown>)['orig'];
        if (typeof orig === 'function') {
            return ({ event, ...params }) =>
                orig({ ...params, event: event || {} });
        }
    }
    throw new Error("Can't mock handlers which are not safely handled");
}
