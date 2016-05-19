﻿"use strict";
_kangoLoader.add("kango/xhr", function(require, exports, module) {
function XHRRequest() {
    this.method = "GET", this.url = "", this.params = {}, this.headers = {}, this.contentType = "", this.username = "", this.password = "", this.mimeType = "", this.sanitizeData = !1
}
function XHRResult() {
    this.response = "", this.status = 0
}
function paramsToString(e) {
    var t = "";
    for (var n in e)e.hasOwnProperty(n) && ("" != t && (t += "&"), t += n + "=" + e[n]);
    return t
}
function XHR() {
}
var utils = require("kango/utils"), io = require("kango/io"), func = utils.func;
XHR.prototype = {
    getXMLHttpRequest: function () {
        return new XMLHttpRequest
    }, _getXMLHttpRequestEx: function (e, t) {
        return this.getXMLHttpRequest()
    }, send: function (e, t) {
        var n = e.method || "GET", r = "undefined" != typeof e.async ? e.async : !0, s = e.params || null, i = e.contentType || "text", o = e.url, a = e.username || null, u = e.password || null, p = e.headers || {}, l = e.mimeType || null, c = e.sanitizeData || !1, f = io.isLocalUrl(o), h = this._getXMLHttpRequestEx(f, r);
        f && (o = io.getExtensionFileUrl(o));
        var y = function (e, t) {
            var n = {
                response: null, status: 0, abort: function () {
                    e.abort()
                }
            };
            if (e.readyState >= 2 && (n.status = e.status, 4 == e.readyState)) {
                if ("xml" == t)n.response = e.responseXML; else if ("json" == t)try {
                    n.response = JSON.parse(e.responseText)
                } catch (r) {
                } else n.response = e.responseText;
                n.abort = function () {
                }
            }
            return c && delete n.abort, n
        }, m = function () {
            return {
                response: null, status: 0, abort: function () {
                }
            }
        };
        null != s && ("object" == typeof e.params && (s = paramsToString(s), "POST" == n && (p["Content-Type"] = "application/x-www-form-urlencoded")), "GET" == n && (o = o + "?" + s, s = null));
        try {
            h.open(n, o, r, a, u)
        } catch (d) {
            if (func.isCallable(t))try {
                t(m())
            } catch (d) {
                if (-2146828218 != d.number && -2146823277 != d.number)throw d
            }
            return m()
        }
        if ("undefined" != typeof h.overrideMimeType && (null != l ? h.overrideMimeType(l) : "json" == i ? h.overrideMimeType("application/json") : "text" == i && h.overrideMimeType("text/plain")), h.onreadystatechange = function () {
                if (4 == h.readyState && func.isCallable(t))try {
                    t(y(h, i))
                } catch (e) {
                    if (-2146828218 != e.number && -2146823277 != e.number)throw e
                }
            }, "object" == typeof p)for (var b in p)p.hasOwnProperty(b) && h.setRequestHeader(b, p[b]);
        try {
            h.send(s)
        } catch (d) {
            if (func.isCallable(t))try {
                t(m())
            } catch (d) {
                if (-2146828218 != d.number && -2146823277 != d.number)throw d
            }
            return m()
        }
        return y(h, i)
    }
}, module.exports = new XHR, module.exports.getPublicApi = function () {
    return utils.createApiWrapper(module.exports, XHR.prototype)
};
});