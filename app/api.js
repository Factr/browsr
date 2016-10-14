import {merge, forEach} from "lodash"

//noinspection JSUnresolvedFunction
require('es6-promise').polyfill()

const config = require('./config')

function generateRoute(path) {
    return `${config.apiUrl}/${path}`
}

function generateHeaders(contentType = "application/json; charset=UTF-8") {
    const result = {}
    
    if (contentType)
        result["Content-Type"] = contentType
    
    const token = kango.storage.getItem('token')
    if (token)
        result["Authorization"] = `Token ${token}`
    
    return result
}

function makeApiRequest(path, method = "GET", opts = {}, contentType) {
    const newOpts = merge({}, {
        method: method,
        url: generateRoute(path),
        headers: generateHeaders(contentType)
    }, opts)
    
    let params = opts.params
    
    if (params && params.constructor.name.toLowerCase() !== "formdata")
        params = JSON.stringify(params)
    
    // Native XHR request
    const xhr = new XMLHttpRequest()
    xhr.open(method, newOpts.url, true)
    
    return new Promise((resolve, reject) => {
        forEach(newOpts.headers, (v, k) => xhr.setRequestHeader(k, v))

        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText))
            } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 400 || xhr.status === 0) {
                reject({
                    noInternet: xhr.status === 0,
                })
            }
        }
        
        xhr.send(params)
    })
}

export function me() {
    const route = 'users/whoami'
    return makeApiRequest(route, "GET")
}

export function login(params) {
    const route = 'auth/token'
    return makeApiRequest(route, "POST", {params: params})
}

export function addItemTags(streamId, itemId, tags) {
    const route = `streams/${streamId}/update_item_tags`
    var params = {
        item_id: itemId,
        added: tags
    }
    return makeApiRequest(route, "POST", {params: params})
}

export function postItem(streamId, params) {
    const route = `streams/${streamId}/post_item`
    return makeApiRequest(route, "POST", {params: params})
}

export function getStreams() {
    const route = `me/streams`
    return makeApiRequest(route, "GET")
}

export function getItemFromUrl(url) {
    const route = `streams/extract_url?url=${encodeURI(url)}`
    return makeApiRequest(route, "GET")
}

export function createStream(formData) {
    return makeApiRequest("streams", "POST", { params: formData }, false)
}
