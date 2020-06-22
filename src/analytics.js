import { makeApiRequest } from "./api"

function addMixpanelEvent(name, args = {}) {

}

export function trackEvent(name, opts = {}) {

}

export function identify(userObject) {

}

export function trackEventCentr(event, meta = {}) {
    return makeApiRequest('track', 'POST', { params: { event, meta } });
}
