'use strict';

exports.KEY_CLIENT_ID = '__mock_clientid';

exports.getCookieItem = function(cookie, key) {
    if (!cookie || !key) return null;
    return decodeURIComponent(cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;
};
