import {merge}  from 'lodash';
import {Promise} from 'es6-promise';
import {getItem} from './db';

const config = require('./config');

function generateRoute(path) {
    return `${config.apiUrl}/${path}`;
}

function generateHeaders() {
    var token = kango.storage.getItem('token');
    if (!token) return {};
    return {
        Authorization: `Bearer ${token}`
    }
}

function makeApiRequest(path, method = "GET", opts) {
    opts = merge({}, {
        method: method,
        url: generateRoute(path),
        headers: generateHeaders(),
        contentType: 'application/json'
    }, opts || {});

    return new Promise(function (resolve, reject) {
        kango.xhr.send(opts, function (data) {
            if (data.status == 200 && data.response != null) {
                resolve(JSON.parse(data.response).data);
            }
            else {
                reject(JSON.parse(data.response));
            }

        })
    })

}

export function me() {
    const route = 'me';
    return makeApiRequest(route, "GET");
}

export function login(params) {
    const route = 'auth/login';
    return makeApiRequest(route, "POST", {params});
}

export function collect(params) {
    const route = `collect-item`;
    return makeApiRequest(route, "POST", {params});
}

export function getCollections() {
    const route = `me/collections`;
    return makeApiRequest(route, "GET");
}

export function createItemFromURL(url){
    const route = `item/from-url?url=${encodeURI(url)}`;
    return makeApiRequest(route, "GET");
}