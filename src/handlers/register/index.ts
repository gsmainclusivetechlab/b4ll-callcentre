import { safeHandle } from '../../services/safeHandle';
import { VerificationState } from '../../services/auth';
import qs from 'querystring';
import { putApprovedUserItem } from '../../services/dynamodb';

export const get = safeHandle(async (request) => {
    const { auth, event } = request;
    const body = qs.parse(event.body || '');
    const callerKey =
        body.Direction === 'outbound-api' ||
        event.queryStringParameters?.Direction === 'outbound-api'
            ? 'Called'
            : 'Caller';
    const Caller = body[callerKey] || event.queryStringParameters?.[callerKey];
    if (auth.state !== VerificationState.REGISTERED) {
        console.log(Caller);
        try {
            if (typeof Caller !== 'string' || Caller.length < 7) {
                throw new Error('Unable to identify caller');
            }
            const approved = {
                id: Caller as string,
            };
            await putApprovedUserItem(approved);
        } catch (e) {
            console.log(e);
            return { status: 'FAILED' };
        }
    }

    return { status: 'OK' };
});
