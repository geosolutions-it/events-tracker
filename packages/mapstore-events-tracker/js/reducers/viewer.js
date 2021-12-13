/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    INIT_VIEWER,
    SET_TOTAL_COUNTERS_VALUES,
    SET_CHART_VALUES,
    SET_TABLE_VALUES,
    SET_DETAIL_VALUES,
    SET_PREVIOUS_QUERY,
    LOADING_SECTION,
    SET_SECTION_ERROR
} from '@js/actions/viewer';

import { RequestId } from '@js/utils/ApiUtils';

function viewer(state = {}, action) {
    switch (action.type) {
    case LOADING_SECTION: {
        return {
            ...state,
            [action.section ? action.section + 'Loading' : 'loading']: true,
            [action.section ? action.section + 'Error' : 'error']: false
        };
    }
    case SET_SECTION_ERROR: {
        return {
            ...state,
            [action.section ? action.section + 'Loading' : 'loading']: false,
            [action.section ? action.section + 'Error' : 'error']: action.error || true
        };
    }
    case INIT_VIEWER: {
        return {
            ...state,
            categories: action.payload.categories,
            datesRange: action.payload.datesRange,
            features: action.payload.features,
            totalNormalizationValues: action.payload.totalNormalizationValues,
            totalFeatureGroup: action.payload.totalFeatureGroup,
            loading: false,
            error: false
        };
    }
    case SET_TOTAL_COUNTERS_VALUES: {
        return {
            ...state,
            counters: action.counters,
            [RequestId.COUNTERS + 'Loading']: false,
            [RequestId.COUNTERS + 'Error']: false
        };
    }
    case SET_CHART_VALUES: {
        return {
            ...state,
            chart: action.chart,
            [RequestId.CHART + 'Loading']: false,
            [RequestId.CHART + 'Error']: false
        };
    }
    case SET_TABLE_VALUES: {
        return {
            ...state,
            table: action.table,
            [RequestId.TABLE + 'Loading']: false,
            [RequestId.TABLE + 'Error']: false
        };
    }
    case SET_DETAIL_VALUES: {
        return {
            ...state,
            detail: action.detail,
            [RequestId.DETAILS + 'Loading']: false,
            [RequestId.DETAILS + 'Error']: false
        };
    }
    case SET_PREVIOUS_QUERY: {
        return {
            ...state,
            previousQuery: action.query
        };
    }
    default:
        return state;
    }
}

export default viewer;
