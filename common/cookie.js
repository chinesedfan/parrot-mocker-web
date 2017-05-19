'use strict';

exports.KEY_CLIENT_ID = '__mock_clientid';
exports.KEY_SERVER = '__mock_server';

exports.getCookieItem = function(cookie, key) {
    if (!cookie || !key) return null;
    return decodeURIComponent(cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
};
exports.generateCookieItem = function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) return '';
    let sExpires = '';
    if (vEnd) {
        switch (vEnd.constructor) {
        case Number:
            sExpires = vEnd === Infinity ? '; expires=Fri, 31 Dec 9999 23:59:59 GMT' : '; max-age=' + vEnd;
            break;
        case String:
            sExpires = '; expires=' + vEnd;
            break;
        case Date:
            sExpires = '; expires=' + vEnd.toUTCString();
            break;
        default:
            break;
        }
    }
    return encodeURIComponent(sKey) + '=' + encodeURIComponent(sValue) + sExpires + (sDomain ? '; domain=' + sDomain : '') + (sPath ? '; path=' + sPath : '') + (bSecure ? '; secure' : '');
};
