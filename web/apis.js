'use strict';

import qs from 'qs';
import {URL_PARAM_CLIENT_ID} from '../common/urlparams';

function fetch(url, opts) {
    return window.fetch(url, opts).then((res) => {
        if (!res || res.status != 200 || !res.ok) throw new Error('Bad response');
        return res.json();
    }).then((json) => {
        if (!json || json.code != 200) {
            throw new Error((json && json.msg) || 'Unknow reason');
        }

        return json;
    });
}

export function setClientID(clientID) {
    return fetch('/api/setclientid?' + qs.stringify({
        [URL_PARAM_CLIENT_ID]: clientID
    }), {
        credentials: 'include'
    });
}

export function loadConfigStr() {
    return fetch('/api/loadconfigstr', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((json) => {
        return json.msg || '[]';
    });
}

export function updateConfig(jsonstr) {
    const maxKb = 1024;
    if (jsonstr && jsonstr.length > maxKb * 1024) return Promise.reject(new Error(`Total mock data is too large(>${maxKb}KB)`));

    return fetch('/api/updateconfig', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: qs.stringify({
            jsonstr
        })
    }).then(() => {
        return 'Succeed to config!';
    }).catch((e) => {
        throw new Error(`Failed to config: ${e.message}`);
    });
}
