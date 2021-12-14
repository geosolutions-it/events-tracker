/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { testEpic } from '@mapstore/framework/epics/__tests__/epicTestUtils';
import axios from '@mapstore/framework/libs/ajax';
import MockAdapter from 'axios-mock-adapter';
import {
    INIT_VIEWER,
    SET_TOTAL_COUNTERS_VALUES,
    SET_CHART_VALUES,
    SET_TABLE_VALUES,
    SET_PREVIOUS_QUERY,
    LOADING_SECTION,
    initViewer
} from '@js/actions/viewer';
import { onLocationChanged } from 'connected-react-router';
import {
    ADD_LAYER,
    ADD_GROUP
} from '@mapstore/framework/actions/layers';
import { configureMap } from '@mapstore/framework/actions/config';
import {
    initAppEpic,
    mgUpdateTotalCountersDataContentEpic,
    mgUpdateMainChartDataContentEpic,
    mgUpdateMapVisualizationEpic,
    mgUpdateTableDataContentEpic,
    mgStoreQueryEpic
} from '../viewer';
import { setConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import { clearStoredRequests } from '@js/utils/ApiUtils';

describe('viewer epics', () => {
    let mockAxios;
    beforeEach(() => {
        mockAxios = new MockAdapter(axios);
    });
    afterEach(() => {
        clearStoredRequests();
        setConfigProp('viewerConfig', undefined);
        mockAxios.restore();
    });
    it('initAppEpic', (done) => {
        setConfigProp('viewerConfig', {
            url: '/geoserver/wfs',
            feature: {
                layer: {}
            }
        });
        mockAxios.onPost().reply(200, {}, {});
        const NUMBER_OF_EXPECTED_ACTIONS = 5;
        const state = {};
        testEpic(
            initAppEpic,
            NUMBER_OF_EXPECTED_ACTIONS,
            configureMap(),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            LOADING_SECTION,
                            ADD_GROUP,
                            ADD_GROUP,
                            ADD_LAYER,
                            INIT_VIEWER
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            state
        );
    });
    it('mgUpdateTotalCountersDataContentEpic', (done) => {
        setConfigProp('viewerConfig', {
            url: '/geoserver/wfs'
        });
        mockAxios.onPost().reply(200, {}, {});
        const NUMBER_OF_EXPECTED_ACTIONS = 2;
        const state = {};
        testEpic(
            mgUpdateTotalCountersDataContentEpic,
            NUMBER_OF_EXPECTED_ACTIONS,
            initViewer(),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            LOADING_SECTION,
                            SET_TOTAL_COUNTERS_VALUES
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            state
        );
    });
    it('mgUpdateMainChartDataContentEpic', (done) => {
        setConfigProp('viewerConfig', {
            url: '/geoserver/wfs'
        });
        mockAxios.onPost().reply(200, {}, {});
        const NUMBER_OF_EXPECTED_ACTIONS = 2;
        const state = {};
        testEpic(
            mgUpdateMainChartDataContentEpic,
            NUMBER_OF_EXPECTED_ACTIONS,
            initViewer(),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            LOADING_SECTION,
                            SET_CHART_VALUES
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            state
        );
    });
    it('mgUpdateMapVisualizationEpic', (done) => {
        setConfigProp('viewerConfig', {
            mapVisualizations: [{
                id: 'points',
                labelId: 'pointsMessage',
                layers: [{
                    type: 'vector',
                    url: '/geoserver/wfs'
                }]
            }]
        });
        mockAxios.onGet().reply(200, {}, {});
        const NUMBER_OF_EXPECTED_ACTIONS = 1;
        const state = {};
        testEpic(
            mgUpdateMapVisualizationEpic,
            NUMBER_OF_EXPECTED_ACTIONS,
            initViewer(),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            ADD_LAYER
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            state
        );
    });
    it('mgUpdateTableDataContentEpic', (done) => {
        setConfigProp('viewerConfig', {
            url: '/geoserver/wfs'
        });
        mockAxios.onPost().reply(200, {}, {});
        const NUMBER_OF_EXPECTED_ACTIONS = 2;
        const state = {};
        testEpic(
            mgUpdateTableDataContentEpic,
            NUMBER_OF_EXPECTED_ACTIONS,
            initViewer(),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            LOADING_SECTION,
                            SET_TABLE_VALUES
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            state
        );
    });
    it('mgStoreQueryEpic', (done) => {
        const NUMBER_OF_EXPECTED_ACTIONS = 1;
        const state = {};
        testEpic(
            mgStoreQueryEpic,
            NUMBER_OF_EXPECTED_ACTIONS,
            onLocationChanged({}, undefined, false),
            (actions) => {
                try {
                    expect(actions.map(({ type }) => type))
                        .toEqual([
                            SET_PREVIOUS_QUERY
                        ]);
                } catch (e) {
                    done(e);
                }
                done();
            },
            state
        );
    });
});
