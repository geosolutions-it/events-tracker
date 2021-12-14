/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import viewer from '../viewer';
import {
    initViewer,
    setTotalCountersValues,
    setChartValues,
    setTableValues,
    setPreviousQuery
} from '@js/actions/viewer';

describe('viewer reducer', () => {
    it('default state', () => {
        const newState = viewer(undefined, {});
        expect(newState).toEqual({});
    });
    it('INIT_VIEWER', () => {
        const payload = {
            categories: [],
            datesRange: { from: '202001', to: '202101' }
        };
        const newState = viewer({}, initViewer(payload));
        expect(newState.categories).toBe(payload.categories);
        expect(newState.datesRange).toBe(payload.datesRange);
    });
    it('SET_TOTAL_COUNTERS_VALUES', () => {
        const counters = [];
        const newState = viewer({}, setTotalCountersValues(counters));
        expect(newState.counters).toBe(counters);
    });
    it('SET_CHART_VALUES', () => {
        const chart = [];
        const newState = viewer({}, setChartValues(chart));
        expect(newState.chart).toBe(chart);
    });
    it('SET_TABLE_VALUES', () => {
        const table = {};
        const newState = viewer({}, setTableValues(table));
        expect(newState.table).toBe(table);
    });
    it('SET_PREVIOUS_QUERY', () => {
        const query = {};
        const newState = viewer({}, setPreviousQuery(query));
        expect(newState.previousQuery).toBe(query);
    });
});
