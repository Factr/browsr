export default window.mixpanel

// Tracking events
function addMixpanelEvent(name, args = {}) {
    //noinspection JSUnresolvedVariable
    if (window.mixpanel) {
        //noinspection JSUnresolvedVariable
        window.mixpanel.track(name, args)
    }
}

export function trackEvent(name, opts = {}) {
    if (typeof window !== "undefined") {
        opts.app_type = "extension"
        addMixpanelEvent(name, opts)
    }
}

export function identify(userObject) {
    window.mixpanel.identify(userObject.id)
    window.mixpanel.people.set({
        $name: userObject.name,
        $distinct_id: userObject.id,
        $email: userObject.email,
        $last_login: new Date(),
        ...userObject
    })
}