/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    INIT_VIEWER,
    initViewer,
    SET_TOTAL_COUNTERS_VALUES,
    setTotalCountersValues,
    SET_CHART_VALUES,
    setChartValues,
    SET_TABLE_VALUES,
    setTableValues,
    SET_PREVIOUS_QUERY,
    setPreviousQuery
} from '../viewer';

describe('viewer actions', () => {
    it('initViewer', () => {
        const payload = {
            categories: [],
            datesRange: { from: '202001', to: '202101' }
        };
        const action = initViewer(payload);
        expect(action.type).toBe(INIT_VIEWER);
        expect(action.payload).toBe(payload);
    });
    it('setTotalCountersValues', () => {
        const counters = [];
        const action = setTotalCountersValues(counters);
        expect(action.type).toBe(SET_TOTAL_COUNTERS_VALUES);
        expect(action.counters).toBe(counters);
    });
    it('setChartValues', () => {
        const chart = [];
        const action = setChartValues(chart);
        expect(action.type).toBe(SET_CHART_VALUES);
        expect(action.chart).toBe(chart);
    });
    it('setTableValues', () => {
        const table = {};
        const action = setTableValues(table);
        expect(action.type).toBe(SET_TABLE_VALUES);
        expect(action.table).toBe(table);
    });
    it('setTableValues', () => {
        const query = {};
        const action = setPreviousQuery(query);
        expect(action.type).toBe(SET_PREVIOUS_QUERY);
        expect(action.query).toBe(query);
    });
});
