/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import castArray from 'lodash/castArray';
import url from 'url';
/**
 * create a href based on the query state
 * @param {object} location hash location (state.router)
 * @param {string} pathname optional pathname to override
 * @param {object} query the query to merge in the existing one in location
 * @param {bool} replaceQuery if true remove the current query in the location and add only the one provided
 */
export const hashLocationToHref = ({
    location,
    pathname,
    query,
    replaceQuery,
    noHash
}) => {

    const { search, ...loc } = location;
    const { query: locationQuery } = url.parse(search || '', true);

    const newQuery = query
        ? replaceQuery
            ? { ...locationQuery, ...query }
            : Object.keys(query).reduce((acc, key) => {
                const value = query[key];
                const currentQueryValues = castArray(acc[key]).filter(val => val);
                const queryValue = currentQueryValues.indexOf(value) === -1
                    ? [...currentQueryValues, value]
                    : currentQueryValues.filter(val => val !== value);
                return { ...acc, [key]: queryValue };
            }, locationQuery)
        : locationQuery;

    return `${noHash ? '' : '#'}${url.format({
        ...loc,
        ...(pathname && { pathname }),
        query: Object.keys(newQuery).reduce((acc, newQueryKey) =>
            !newQuery[newQueryKey] || newQuery[newQueryKey].length === 0
                ? acc
                : { ...acc,  [newQueryKey]: newQuery[newQueryKey]}, {})
    })}`;
};

/**
 * get the query from the hash path
 * @param {object} location hash location (state.router)
 */
export const getHashQueryParameters = (location = {}) => {
    const { query = {} } = url.parse(location?.search || '', true) || {};
    return query;
};
