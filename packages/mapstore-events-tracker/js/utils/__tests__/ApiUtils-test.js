/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    clearStoredRequests,
    memoizeRequest,
    RequestId
} from '../ApiUtils';

describe('ApiUtils', () => {
    afterEach(() => {
        clearStoredRequests();
    });
    it('memoizeRequest should use the stored response if the location and id are the same', () => {
        const location = {
            search: '?category=2'
        };
        const response = { result: [] };
        memoizeRequest({
            id: RequestId.COUNTERS,
            location,
            request: () => new Promise(resolve => resolve(response))
        }).then((firstResponseNotStored) => {
            expect(firstResponseNotStored).toBe(response);

            // usually the request is the same
            // here it is different only for testing purpose
            // to verify if the previous request it's actually stored
            memoizeRequest({
                id: RequestId.COUNTERS,
                location,
                // this request should not be used because the id and location are the same as before
                request: () => new Promise(resolve => resolve('WRONG_RESPONSE'))
            }).then((secondResponseStored) => {
                expect(secondResponseStored).toBe(response);
            });
        });
    });
});
