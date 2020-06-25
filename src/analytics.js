import { makeApiRequest } from "./api"

export function trackEventCentr(event, meta = {}) {
    return makeApiRequest('track', 'POST', { params: { event, meta } });
}
