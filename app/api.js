import {merge} from "lodash";
import {Promise} from "es6-promise";

const config = require('./config');

function generateRoute(path) {
    return `${config.apiUrl}/${path}`;
}

function generateHeaders() {
    var token = kango.storage.getItem('token');
    console.log(token);
    if (!token) return {
       

    };
    return {
        Authorization: `Token ${token}`,
        'Referer': 'https://factr.com',
        'Host': 'https://factr.com'

    }
}

function makeApiRequest(path, method = "GET", opts) {
    opts = merge({}, {
        method: method,
        url: generateRoute(path),
        headers: generateHeaders()
    }, opts || {});
    console.log(opts);
    return new Promise(function (resolve, reject) {
        kango.xhr.send(opts, function (data) {
            console.log(data);
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
    const route = 'auth/token';
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

export function createItemFromURL(url) {
    const route = `item/from-url?url=${encodeURI(url)}`;
    return makeApiRequest(route, "GET");
}