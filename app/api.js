import {merge} from "lodash";
import {Promise} from "es6-promise";

const config = require('./config');

function generateRoute(path) {
    return `${config.apiUrl}/${path}`;
}

function generateHeaders() {
    var token = kango.storage.getItem('token');
    if (!token) return {};
    return {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
    }
}

function makeApiRequest(path, method = "GET", opts) {
    opts = merge({}, {
        method: method,
        url: generateRoute(path),
        headers: generateHeaders()
    }, opts || {});
    document.cookie = '';
    return new Promise(function (resolve, reject) {
        kango.xhr.send(opts, function (data) {
            if (data.status == 200) {
                return resolve(JSON.parse(data.response));
            }
            else {
                return reject(JSON.parse(data.response));
            }

        })
    })

}

export function me() {
    const route = 'me/';
    return makeApiRequest(route, "GET");
}

export function login(params) {
    const route = 'auth/token';
    return makeApiRequest(route, "POST", {params: params});
}

export function addItemTags(streamId, itemId, tags) {
    const route = `streams/${streamId}/update_item_tags`;
    var params = {
        item_id: itemId,
        added: tags
    };
    return makeApiRequest(route, "POST", {params: params});
}

export function postItem(streamId, params) {
    const route = `streams/${streamId}/post_item`;
    return makeApiRequest(route, "POST", {params: params});
}

export function getStreams() {
    const route = `me/streams`;
    return makeApiRequest(route, "GET");
}

export function getItemFromUrl(url) {
    const route = `sourceitems/extract_url?url=${encodeURI(url)}`;
    return makeApiRequest(route, "GET");
}