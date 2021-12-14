/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import castArray from 'lodash/castArray';
import { getHashQueryParameters } from '@js/utils/LocationUtils';

let storedRequests = {};

// create an hash based on an id and the location query
function getHash(id, query) {
    const keys = Object.keys(query).sort((a, b) => a > b ? 1 : -1);
    let str = '';
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        str += key + ':';
        if (query[key]) {
            str += castArray(query[key]).sort((a, b) => a > b ? 1 : -1).join();
        }
        str += ';';
    }
    return `${id}:${str}`;
}

export const RequestId = {
    COUNTERS: 'counters',
    CHART: 'chart',
    MAP: 'map',
    TABLE: 'table',
    DETAILS: 'detail'
};
/**
 * this function uses an id and the query of the current location as hash value to store the response
 * if it recognizes the hash on following requests it will returns a promise with the stored response
 * @param {string} id unique if for the request
 * @param {function} request a function that returns a promise
 * @param {object} location the hash router location
 * @returns a promise with the request response
 */
export function memoizeRequest({
    id,
    request,
    location
}) {

    const query = getHashQueryParameters(location);
    const hash = getHash(id, query);

    if (storedRequests[hash]) {
        return new Promise((resolve) => resolve(storedRequests[hash]));
    }

    return request()
        .then((response) => {
            if (!storedRequests[hash]) {
                storedRequests[hash] = response;
            }
            return response;
        });
}
/**
 * clear all the stored requests
 */
export function clearStoredRequests() {
    storedRequests = {};
}
