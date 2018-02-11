'use strict';

import qs from 'qs';

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

export function loadConfigStr() {
    return fetch('/api/loadconfigstr', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then((json) => {
        return json.msg || '[]';
    });
}

export function updateConfig(jsonstr) {
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
