export function streamInternalToExternal({ name, desc, isPublic }) {
    return {
        name,
        description: desc,
        public: isPublic,
    }
}

export function streamExternalToInternal(external) {
    return {
        id: external.id,
        name: external.name,
        desc: external.description,
        isPublic: external.public,
        slug: external.slug,
    }
}

export function formatResponseError(err, noThrow = false, prefix = '') {
    let message
    
    if (err)
        message = typeof err === 'object' ? (err.message || `[${err.status}] ${err.statusText}`) : err
    else
        message = 'No internet connection'
    
    message = `${prefix ? prefix + ' : ' : ''}${message}`
    
    if (noThrow)
        return new Error(message)
    else
        throw new Error(message)
}

export function checkRadio(radio) {
    radio.setAttribute('checked', 'checked')
    radio.checked = true
}

export function uncheckRadio(radio) {
    radio.removeAttribute('checked')
    radio.checked = false
}
