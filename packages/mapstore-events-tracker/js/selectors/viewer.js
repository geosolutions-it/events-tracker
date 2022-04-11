/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import castArray from 'lodash/castArray';
import {
    hashLocationToHref,
    getHashQueryParameters
} from '@js/utils/LocationUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import { mapSelector } from '@mapstore/framework/selectors/map';
import {
    BASE_LAYER_GROUP,
    MAP_VIZ_LAYER_GROUP
} from '@js/utils/LayerUtils';
import { getMessageById } from '@mapstore/framework/utils/LocaleUtils';

const DATE_NOW = moment(Date.now());

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};
/**
 * get the selected categories including their count value
 * @param {object} state redux state
 */
export const getViewerCategories = (state) => {
    const categories = state?.viewer?.categories || EMPTY_ARRAY;
    const counters = state?.viewer?.counters || EMPTY_ARRAY;
    const location = state?.router?.location;
    const query = getHashQueryParameters(location);
    const categoriesQuery = castArray(query.category || []);
    return categories.map(({ value, labelId, color }) => {
        const selected = !!(categoriesQuery.indexOf(value) !== -1);
        const { count } = (counters.find(counter => counter.category === value) || { count: 0 });
        return {
            id: labelId,
            labelId,
            value,
            count,
            color,
            selected,
            href: hashLocationToHref({
                location,
                query: {
                    category: value
                }
            })
        };
    });
};
/**
 * get the date range calculated based on the datastore date limits
 * if the date limits and the query are missing it will use the current date to compute the default date range
 * @param {object} state redux state
 */
export const getDateRange = (state) => {
    const viewerConfig = getConfigProp('viewerConfig');
    const dateFormat = viewerConfig?.date?.format || 'YYYYMM';
    const location = state?.router?.location;
    const datesRange = state?.viewer?.datesRange;
    const query = getHashQueryParameters(location) || {};
    const maxDate = datesRange?.to || DATE_NOW.format(dateFormat);
    const initialMinDate = moment(maxDate, dateFormat).subtract(1, 'months').format(dateFormat);
    const to = query.to || maxDate;
    const from = query.from || initialMinDate;
    const toDate = moment(to, dateFormat);
    const fromDate = moment(from, dateFormat);
    const absMinDate = datesRange && moment(datesRange?.from, dateFormat);
    const absMaxDate = datesRange && moment(datesRange?.to, dateFormat);
    return {
        from: {
            value: fromDate.toDate(),
            formatValue: fromDate.format(dateFormat),
            max: toDate.toDate(),
            min: absMinDate?.toDate()
        },
        to: {
            value: toDate.toDate(),
            formatValue: toDate.format(dateFormat),
            min: fromDate.toDate(),
            max: absMaxDate?.toDate()
        }
    };
};

/**
 * get the data for the main chart in the viewer
 * @param {object} state redux state
 */
export const getMainChartData = (state) => {
    const categories = state?.viewer?.categories || EMPTY_ARRAY;
    const viewerConfig = getConfigProp('viewerConfig');
    const chart = state?.viewer?.chart || {};
    const data = (chart?.data || EMPTY_ARRAY)
        .map((entry) => {
            const { labelId, color } = (categories.find(category => category.value === entry.category) || {});
            return {
                ...entry,
                mode: 'lines',
                line: {
                    color: color || viewerConfig.defaultChartColor || '#333333',
                    width: 2
                },
                name: labelId
            };
        });
    return {
        ...chart,
        data
    };
};

/**
 * get shapes for plotly js to highlight specific sections
 * such as the selected date range
 * @param {object} state redux state
 */
export const getMainChartShapes = (state) => {
    const viewerConfig = getConfigProp('viewerConfig');
    const dateFormat = viewerConfig?.date?.format || 'YYYYMM';
    const dateRange = getDateRange(state);
    const isoDataFrom = moment( dateRange.from.value,  dateFormat).toISOString();
    const isoDateTo = moment( dateRange.to.value,  dateFormat).toISOString();
    const shapes = [
        {
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: isoDataFrom,
            y0: 0,
            x1: isoDateTo,
            y1: 1,
            fillcolor: '#d3d3d3',
            opacity: 0.2,
            line: {
                width: 0
            }
        },
        {
            type: 'line',
            xref: 'x',
            yref: 'paper',
            x0: isoDataFrom,
            y0: 0,
            x1: isoDataFrom,
            y1: 1,
            line: {
                color: '#333333',
                width: 2,
                dash: 'dash'
            }
        },
        {
            type: 'line',
            xref: 'x',
            yref: 'paper',
            x0: isoDateTo,
            y0: 0,
            x1: isoDateTo,
            y1: 1,
            line: {
                color: '#333333',
                width: 2,
                dash: 'dash'
            }
        }
    ];
    return shapes;
};

/**
 * get the data table of targeted feature
 * @param {object} state redux state
 */
export const getTableData = (state) => {
    const table = state?.viewer?.table || EMPTY_OBJECT;
    const location = state?.router?.location;
    const viewerConfig = getConfigProp('viewerConfig');
    const featureKey = viewerConfig?.feature?.key || 'feature';
    const query = getHashQueryParameters(location);
    const featureQuery = castArray(query.feature || []);
    const rowWithHref =  table?.rows?.map((row) => {
        const value = (row[featureKey]?.value || row[featureKey]) + '';
        const selected = !!featureQuery.find((feature) => feature === value);
        return {
            ...row,
            '@props': {
                selected,
                selectedHref: hashLocationToHref({
                    location,
                    query: {
                        feature: value + ''
                    },
                    overrideQuery: parsedQuery => ({
                        ...parsedQuery,
                        ...(parsedQuery?.feature?.length > 0
                            && parsedQuery.feature.includes(value + '')
                            && { 'feature-viz': 'detail' })
                    })
                })
            }
        };
    }) || [];
    return {
        ...table,
        rows: rowWithHref
    };
};

/**
 * @param {object} state redux state
 */
export const getDetailData = (state) => {
    const { lineCharts = [], counters = [],  ...detail } = state?.viewer?.detail || EMPTY_OBJECT;
    const categories = state?.viewer?.categories || EMPTY_ARRAY;
    const viewerConfig = getConfigProp('viewerConfig');
    const lineChartsWithCategories = lineCharts.map((lineChart) => {
        const data = lineChart.data.map((chart) => {
            const { labelId, color } = (categories.find(category => category.value === chart.category) || {});
            return {
                ...chart,
                mode: 'lines',
                line: {
                    color: color || viewerConfig.defaultChartColor || '#333333',
                    width: 2
                },
                name: labelId
            };
        });
        return {
            ...lineChart,
            data
        };
    });
    const countersWithCategories = counters.map((entry) => {
        const { labelId, color } = (categories.find(category => category.value === entry.category) || {});
        return {
            id: labelId,
            labelId,
            value: entry.category,
            count: entry.count,
            color
        };
    });
    return { ...detail, lineCharts: lineChartsWithCategories, counters: countersWithCategories };
};

/**
 * get the general categories info such as labelId, color, value, ...
 * @param {object} state redux state
 */
export const getCategoriesInfo = (state) => {
    const categories = state?.viewer?.categories || EMPTY_ARRAY;
    return categories;
};

/**
 * get selected map visualization
 * @param {object} state redux state
 */
export const getMapVisualization = (state) => {
    const location = state?.router?.location;
    const viewerConfig = getConfigProp('viewerConfig');
    const mapVisualizations = (viewerConfig.mapVisualizations || EMPTY_ARRAY);
    const query = getHashQueryParameters(location);
    const value = query['map-viz'] || mapVisualizations?.[0]?.id || '';
    const { labelId } = mapVisualizations.find(({ id }) => id === value) || EMPTY_OBJECT;
    return { labelId, value, label: labelId };
};

/**
 * get the layers used by the selected map visualization
 * @param {object} state redux state
 */
export const getMapVisualizationLayers = (state) => {
    const map = mapSelector(state);
    const resolution = map?.resolution;
    const layers = state?.layers?.flat?.filter(({ group, minResolution = -Infinity, maxResolution = Infinity }) =>
        group === MAP_VIZ_LAYER_GROUP
        && (resolution >= minResolution && resolution < maxResolution || resolution === undefined)
    );
    return layers;
};

/**
 * get map base layer related to viewerConfig.feature.layer configuration
 * @param {object} state redux state
 */
export const getMapBaseLayer = (state) => {
    const layers = state?.layers?.flat?.filter(({ group }) => group === BASE_LAYER_GROUP);
    return layers[0];
};

/**
 * get all the available map visualization as selected options
 * @param {object} state redux state
 */
export const getMapVisualizationOptions = () => {
    const viewerConfig = getConfigProp('viewerConfig');
    return (viewerConfig.mapVisualizations || EMPTY_ARRAY).map(({ id, labelId }) => ({
        value: id,
        labelId,
        label: labelId
    }));
};

/**
 * compare current and previous query
 * @param {object} state redux state
 * @param {array} params list of string that represent params to compare if undefined all the query is compared
 */
export function isQueryEqual(state, params) {
    const location = state?.router?.location;
    const query = getHashQueryParameters(location);
    const previousQuery = state?.viewer?.previousQuery;
    const queryFiltered = params
        ? params.reduce((acc, key) => ({...acc, [key]: query[key]}), {})
        : query;
    const previousQueryFiltered = params
        ? params.reduce((acc, key) => ({...acc, [key]: previousQuery[key]}), {})
        : previousQuery;
    return isEqual(queryFiltered, previousQueryFiltered);
}


/**
 * @param {object} state redux state
 */
export const getFeatureVisualizationTabs = (state) => {
    const location = state?.router?.location;
    return [
        {
            id: 'table',
            href: hashLocationToHref({
                location,
                query: {
                    ['feature-viz']: 'table'
                },
                replaceQuery: true
            }),
            labelId: 'msEventsTracker.labels.table'
        },
        {
            id: 'detail',
            href: hashLocationToHref({
                location,
                query: {
                    ['feature-viz']: 'detail'
                },
                replaceQuery: true
            }),
            labelId: 'msEventsTracker.labels.detail'
        }
    ];
};

/**
 * @param {object} state redux state
 */
export const getFeatureVisualization = (state) => {
    const location = state?.router?.location;
    const query = getHashQueryParameters(location);
    return query['feature-viz'] || 'table';
};

/**
 * @param {object} state redux state
 */
export const getSelectedFeatures = (state) => {
    const location = state?.router?.location;
    const query = getHashQueryParameters(location);
    const messages = state?.locale?.messages;
    const featureName = getMessageById(messages, 'msEventsTracker.feature');
    const selected = castArray(query.feature || []).map((value) => {
        return {
            value: value,
            label: value + ' ' + featureName
        };
    });
    return selected;
};

/**
 * @param {object} state redux state
 */
export const getFeatureOptions = (state) => {
    const features = state?.viewer?.features || EMPTY_ARRAY;
    const viewerConfig = getConfigProp('viewerConfig');
    const regionLayerKey = viewerConfig?.feature?.layer?.key;
    const messages = state?.locale?.messages;
    const featureName = getMessageById(messages, 'msEventsTracker.feature');
    return features.map(({ properties }) => {
        const value = properties[regionLayerKey];
        return {
            value: value + '',
            label: value + ' ' + featureName
        };
    }).sort((a, b) => a.value * 1 > b.value * 1 ? 1 : -1);
};
