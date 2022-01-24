/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const INIT_VIEWER = 'VIEWER:INIT';
export const SET_TOTAL_COUNTERS_VALUES = 'VIEWER:SET_TOTAL_COUNTERS_VALUES';
export const SET_CHART_VALUES = 'VIEWER:SET_CHART_VALUES';
export const SET_TABLE_VALUES = 'VIEWER:SET_TABLE_VALUES';
export const SET_DETAIL_VALUES = 'VIEWER:SET_DETAIL_VALUES';
export const SET_PREVIOUS_QUERY = 'VIEWER:SET_PREVIOUS_QUERY';
export const LOADING_SECTION = 'VIEWER:LOADING_SECTION';
export const SET_SECTION_ERROR = 'VIEWER:SET_SECTION_ERROR';
export const THEME_UPDATE = 'VIEWER:THEME_UPDATE';

export const initViewer = (payload) => ({
    type: INIT_VIEWER,
    payload
});

export const setTotalCountersValues = (counters) => ({
    type: SET_TOTAL_COUNTERS_VALUES,
    counters
});

export const setChartValues = (chart) => ({
    type: SET_CHART_VALUES,
    chart
});

export const setTableValues = (table) => ({
    type: SET_TABLE_VALUES,
    table
});

export const setDetailValues = (detail) => ({
    type: SET_DETAIL_VALUES,
    detail
});

export const setPreviousQuery = (query) => ({
    type: SET_PREVIOUS_QUERY,
    query
});

export const loadingSection = (section) => ({
    type: LOADING_SECTION,
    section
});

export const setSectionError = (section, error) => ({
    type: SET_SECTION_ERROR,
    section,
    error
});

export const checkThemeUpdate = () => ({
    type: THEME_UPDATE,
    themeUpdate: localStorage.getItem('ms.themeVariantEnabled')
});

