/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    hashLocationToHref,
    getHashQueryParameters
} from '../LocationUtils';

describe('LocationUtils', () => {
    it('hashLocationToHref should add a new query to href', () => {
        const location = {
            search: ''
        };
        const href = hashLocationToHref({
            location,
            query: {
                key: 'property'
            }
        });
        expect(href).toBe('#?key=property');
    });
    it('hashLocationToHref should remove a param to href if exist in current query', () => {
        const location = {
            search: '?key=property'
        };
        const href = hashLocationToHref({
            location,
            query: {
                key: 'property'
            }
        });
        expect(href).toBe('#');
    });
    it('hashLocationToHref should add a new query to href as array', () => {
        const location = {
            search: '?key=property'
        };
        const href = hashLocationToHref({
            location,
            query: {
                key: 'new-property'
            }
        });
        expect(href).toBe('#?key=property&key=new-property');
    });
    it('hashLocationToHref should replace all query param with replaceQuery set to true', () => {
        const location = {
            search: '?key=property&key=new-property&category=value'
        };
        const href = hashLocationToHref({
            location,
            replaceQuery: true,
            query: {
                key: 'value'
            }
        });
        expect(href).toBe('#?key=value&category=value');
    });
    it('hashLocationToHref should remove the hash from the generated href with noHash equal to true', () => {
        const location = {
            search: '?key=property&key=new-property&category=value'
        };
        const href = hashLocationToHref({
            location,
            replaceQuery: true,
            noHash: true,
            query: {
                key: 'value'
            }
        });
        expect(href).toBe('?key=value&category=value');
    });
    it('hashLocationToHref should use the new pathname if provided', () => {
        const location = {
            search: '?key=property&key=new-property&category=value'
        };
        const href = hashLocationToHref({
            location,
            replaceQuery: true,
            pathname: '/search',
            query: {
                key: 'value'
            }
        });
        expect(href).toBe('#/search?key=value&category=value');
    });
    it('getHashQueryParameters should get the query from hash path in a location object', () => {
        const location = {
            search: '?key=property'
        };
        const query = getHashQueryParameters(location);
        expect(query.key).toBe('property');
    });
    it('getHashQueryParameters should return an empty object if location is undefined', () => {
        const query = getHashQueryParameters();
        expect(query).toEqual({});
    });
});
