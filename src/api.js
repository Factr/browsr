import { merge, forEach, map } from 'lodash'
import config from './config'
import storage from 'storage'

//noinspection JSUnresolvedFunction
require('es6-promise').polyfill()

function generateRoute(path, frontend) {
    return `${frontend ? config.frontendUrl : config.apiUrl}/${path}`
}

function generateHeaders(contentType = 'application/json; charset=UTF-8') {
    const result = {}

    if (contentType) {
        result['Content-Type'] = contentType
    }

    const token = storage.getItem('token')
    if (token) {
        result['Authorization'] = `Token ${token}`
    }

    return result
}

export function makeApiRequest(path = {}, method = 'GET', opts = {}, contentType) {
    const url = typeof path === 'string' ? path : path.url
    //noinspection JSUnresolvedVariable

    const newOpts = merge({}, {
        method: method,
        url: generateRoute(url, path.frontend, path.fullUrl),
        headers: generateHeaders(contentType),
    }, opts)

    let params = opts.params
    if (params && params.constructor.name.toLowerCase() !== 'formdata') {
        params = JSON.stringify(params)
    }

    // Native XHR request
    const xhr = new XMLHttpRequest()
    xhr.open(method, newOpts.url, true)

    return new Promise((resolve, reject) => {
        forEach(newOpts.headers,
            (headerValue, headerKey) => xhr.setRequestHeader(headerKey, headerValue))
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText))
            } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status >= 400 || xhr.status
                === 0) {
                reject({ noInternet: xhr.status === 0 })
            }
        }
        xhr.send(params)
    })
}

export function me() {
    const route = 'user/whoami'
    return makeApiRequest(route, 'GET')
}

export function login(params) {
    const route = 'auth/token'
    return makeApiRequest(route, 'POST', { params: params })
}

export function authLinkedIn(code, redirect_uri) {
    const params = { code, redirect_uri: encodeURIComponent(redirect_uri), keep_token: true }
    const url = `auth/linkedin?${map(params, (v, k) => `${k}=${v}`).join('&')}`

    return makeApiRequest({
        url,
        frontend: true,
    })
}

export function authGoogle(access_token) {
    return makeApiRequest({
        url: `oauth/google-oauth2/?access_token=${access_token}&json=true`,
        frontend: false,
    })
}

export function addItemTags(streamId, itemId, tags) {
    const route = `stream/${streamId}/update_item_tags`
    const params = {
        item_id: itemId,
        added: tags,
    }
    return makeApiRequest(route, 'POST', { params: params })
}

export function postItem(streamId, params) {
    const route = `stream/${streamId}/post_item`
    return makeApiRequest(route, 'POST', { params: params })
}

export function getStreams() {
    const route = `stream/contributable?limit=1000&mobile=true&nano_serializer=true`
    return makeApiRequest(route, 'GET')
}

export function getRecentStreams(params) {
    const route = !params ? 'user/recent_streams' : `user/recent_streams?sort=${params.sort ? params.sort : ''}&limit=${params.limit ? params.limit : ''}`;
    return makeApiRequest(route, 'GET')
}

export function getItemFromUrl(url) {
    const route = `stream/extract_url?url=${encodeURI(url)}`
    return makeApiRequest(route, 'GET')
}

export function createStream(formData) {
    return makeApiRequest('stream', 'POST', { params: formData }, false)
}
