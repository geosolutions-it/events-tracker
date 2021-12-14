/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import { LOCATION_CHANGE } from 'connected-react-router';
import castArray from 'lodash/castArray';
import min from 'lodash/min';
import max from 'lodash/max';

import aggregate from '@mapstore/framework/observables/wps/aggregate';
import { getWPSURL } from '@mapstore/framework/observables/wps/common';

import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import { MAP_CONFIG_LOADED } from '@mapstore/framework/actions/config';
import {
    addLayer,
    removeLayer,
    updateNode,
    addGroup
} from '@mapstore/framework/actions/layers';
import { getHashQueryParameters } from '@js/utils/LocationUtils';
import {
    getDateRange,
    getCategoriesInfo,
    isQueryEqual
} from '@js/selectors/viewer';
import {
    INIT_VIEWER,
    initViewer,
    setTotalCountersValues,
    setChartValues,
    setTableValues,
    setDetailValues,
    setPreviousQuery,
    loadingSection,
    setSectionError
} from '@js/actions/viewer';
import camelCase from 'lodash/camelCase';
import axios from '@mapstore/framework/libs/ajax';
import {
    getNormalizationValue,
    getNormalizationDenominators
} from '@js/selectors/normalizer';
import {
    getFilter,
    computeClassifiedFeatures,
    responseToMainChart,
    responseToTable,
    responseToFeaturesDetail
} from '@js/utils/ViewerUtils';
import turfArea from '@turf/area';
import uuid from 'uuid';
import {
    BASE_LAYER_GROUP,
    MAP_VIZ_LAYER_GROUP,
    groupFeatureByProperty
} from '@js/utils/LayerUtils';

import {
    RequestId,
    memoizeRequest
} from '@js/utils/ApiUtils';

/**
 * parse the layer configuration to request feature in case of vector type
 * this function looks for a custom property classification
 * that allows the app to apply the style client side
 */
function getLayerConfig({
    store,
    layer,
    params,
    overrideOptions = l => l
}) {
    if (layer && layer.type === 'vector' && layer.url) {
        return axios.get(layer.url, {
            params: {
                ...layer.params,
                ...params
            }
        }).then(({ data }) => {
            const groupedFeatures = groupFeatureByProperty(data?.features, layer?.groupBy);
            const state = store.getState();
            const normalizer = getNormalizationValue(state);
            const features = computeClassifiedFeatures({
                features: groupedFeatures,
                classification: layer?.classification,
                normalizer,
                style: layer.style
            });
            return overrideOptions({
                ...layer,
                uuid: uuid(),
                features
            });
        });
    }
    return new Promise(resolve => resolve(overrideOptions(layer)));
}

function applyStyleToBaseLayer(baseLayer, location) {
    const queryParams = getHashQueryParameters(location);
    const featuresQuery =  castArray(queryParams.feature || []);
    const viewerConfig = getConfigProp('viewerConfig');
    const regionLayerKey = viewerConfig?.feature?.layer?.key;
    const features = baseLayer?.features?.map((feature) => {
        const selected = featuresQuery.indexOf(feature.properties[regionLayerKey] + '') !== -1;
        return {
            ...feature,
            style: selected
                ? {
                    fillColor: viewerConfig.defaultChartColor,
                    fillOpacity: 0,
                    color: viewerConfig.defaultChartColor,
                    weight: 4
                }
                : { // hide feature if not selected
                    fillColor: viewerConfig.defaultChartColor,
                    fillOpacity: 0,
                    weight: 0.001
                }
        };
    });
    return {
        ...baseLayer,
        features
    };
}

/**
 * get initial information such as the available categories
 * related to the selected feature type name
 */
export const initAppEpic = (action$, store) =>
    action$.ofType(MAP_CONFIG_LOADED)
        .take(1)
        .switchMap(() => {
            const state = store.getState();
            const viewerConfig = getConfigProp('viewerConfig');
            const wpsUrl = getWPSURL(viewerConfig.url, {
                REQUEST: 'Execute',
                version: '1.0.0'
            });
            const categoryKey = viewerConfig?.category?.key;
            const dateKey = viewerConfig?.date?.key;
            const wpsFeatureTypeName = viewerConfig.featureTypeName;
            const featureLayer = viewerConfig?.feature?.layer;
            const featureKey = viewerConfig?.feature?.key;
            const featureGroupKey = viewerConfig?.feature?.group;
            const location = state?.router?.location;
            // get available categories type
            return Observable.defer(() => Promise.all([
                aggregate(wpsUrl, {
                    featureType: wpsFeatureTypeName,
                    aggregationAttribute: '',
                    aggregateFunction: 'Count',
                    groupByAttributes: categoryKey
                }).toPromise(),
                aggregate(wpsUrl, {
                    featureType: wpsFeatureTypeName,
                    aggregationAttribute: '',
                    aggregateFunction: 'Count',
                    groupByAttributes: dateKey
                }).toPromise(),
                getLayerConfig({
                    store,
                    layer: featureLayer,
                    overrideOptions: (options) => ({
                        ...options,
                        group: BASE_LAYER_GROUP,
                        id: BASE_LAYER_GROUP
                    })
                })
            ]))
                .switchMap(([categoriesResponse, dateResponse, baseLayer]) => {
                    const categories = categoriesResponse?.AggregationResults?.map(([value]) => ({ value, labelId: camelCase(value) })) || [];
                    const dates = dateResponse?.AggregationResults?.map(([value]) => value) || [];
                    const from = min(dates);
                    const to = max(dates);
                    const features = baseLayer?.features
                        ?.map((feature) => ({
                            ...feature,
                            properties: {
                                ...feature.properties,
                                area: turfArea(feature)
                            }
                        }))
                        .sort((a, b) => a[featureKey] > b[featureKey] ? 1 : -1);
                    const normalizationDenominators = getNormalizationDenominators(state);
                    const totalNormalizationValues = normalizationDenominators
                        .map(({ value }) => {
                            const total = features?.[0]?.properties?.[value] !== undefined
                                ? features.reduce((sum, { properties }) => sum + properties[value], 0)
                                : 1;
                            return {
                                value,
                                total
                            };
                        });
                    const totalFeatureGroup = normalizationDenominators
                        .map(({ value }) => {
                            const total = features?.reduce((acc, { properties }) => {
                                const group = properties[featureGroupKey];
                                return {
                                    ...acc,
                                    [group]: acc[group] !== undefined
                                        ? acc[group] + properties[value]
                                        : properties[value]
                                };
                            }, {}) || 1;
                            return {
                                value,
                                total
                            };
                        });
                    return Observable.of(
                        addGroup({ }, undefined, { id: MAP_VIZ_LAYER_GROUP }),
                        addGroup({ }, undefined, { id: BASE_LAYER_GROUP }),
                        ...(baseLayer ? [addLayer(applyStyleToBaseLayer(baseLayer, location))] : []),
                        initViewer({
                            categories: viewerConfig.categories || categories,
                            datesRange: {
                                from,
                                to
                            },
                            features,
                            totalNormalizationValues,
                            totalFeatureGroup
                        })
                    );
                })
                .catch((error) => {
                    return Observable.of(
                        setSectionError('', { msgId: 'msEventsTracker.errorInit', message: error?.message })
                    );
                })
                .startWith(loadingSection(''));
        });

/**
 * get all the total count for the available categories
 * used by the total counters
 */
export const mgUpdateTotalCountersDataContentEpic = (action$, store) =>
    action$.ofType(INIT_VIEWER, LOCATION_CHANGE)
        .filter(action => !action?.payload?.isFirstRendering)
        .switchMap((action) => {
            const state = store.getState();
            const viewerConfig = getConfigProp('viewerConfig');
            const wpsUrl = getWPSURL(viewerConfig.url, {
                REQUEST: 'Execute',
                version: '1.0.0'
            });
            const categoryKey = viewerConfig?.category?.key;
            const wpsFeatureTypeName = viewerConfig.featureTypeName;
            const dateKey = viewerConfig?.date?.key;
            const dateType = viewerConfig?.date?.type;
            const dateRange = getDateRange(state);
            const location = action?.payload?.location || state?.router?.location;

            return Observable.defer(
                () => memoizeRequest({
                    id: RequestId.COUNTERS,
                    location,
                    request: () => aggregate(wpsUrl, {
                        featureType: wpsFeatureTypeName,
                        aggregationAttribute: '',
                        aggregateFunction: 'Count',
                        groupByAttributes: categoryKey,
                        filter: getFilter({
                            date: {
                                key: dateKey,
                                value: {
                                    from: dateRange.from.formatValue,
                                    to: dateRange.to.formatValue
                                },
                                type: dateType
                            }
                        })
                    }).toPromise()
                        .then((response) => {
                            const normalizer = getNormalizationValue(state);
                            const totalNormalizationValues = state?.viewer?.totalNormalizationValues || [];
                            const { total = 1 } = totalNormalizationValues.find((entry) => entry.value === normalizer.value) || {};
                            const multiplier = normalizer?.params?.multiplier || 1;
                            const counters = response?.AggregationResults
                                ?.map(([category, count]) => ({ category, count: (count / total) * multiplier })) || [];
                            return counters;
                        })
                })
            )
                .switchMap((counters) => {
                    return Observable.of(setTotalCountersValues(counters));
                })
                .catch((error) => {
                    return Observable.of(
                        setSectionError(RequestId.COUNTERS, { msgId: 'error.counters', message: error?.message })
                    );
                })
                .startWith(loadingSection(RequestId.COUNTERS));
        });

/**
 * get the count over dates of the selected categories
 * used by the main chart
 */
export const mgUpdateMainChartDataContentEpic = (action$, store) =>
    action$.ofType(INIT_VIEWER, LOCATION_CHANGE)
        .filter(action => !action?.payload?.isFirstRendering)
        .switchMap((action) => {
            const state = store.getState();
            const location = action?.payload?.location || state?.router?.location;
            const viewerConfig = getConfigProp('viewerConfig');
            const wpsUrl = getWPSURL(viewerConfig.url, {
                REQUEST: 'Execute',
                version: '1.0.0'
            });
            const categoryKey = viewerConfig?.category?.key;
            const wpsFeatureTypeName = viewerConfig.featureTypeName;
            const dateKey = viewerConfig?.date?.key;
            const queryParams = getHashQueryParameters(location);
            const categories = castArray(queryParams.category || []);
            return Observable.defer(() =>
                memoizeRequest({
                    id: RequestId.CHART,
                    location,
                    request: () => aggregate(wpsUrl, {
                        featureType: wpsFeatureTypeName,
                        aggregationAttribute: '',
                        aggregateFunction: 'Count',
                        groupByAttributes: categories.length > 0
                            ? [dateKey, categoryKey]
                            : dateKey,
                        filter: getFilter({
                            ...(categories.length > 0 && {
                                category: {
                                    key: categoryKey,
                                    value: categories,
                                    type: viewerConfig?.category?.type
                                }
                            })
                        })
                    }).toPromise()
                        .then((response) => {
                            const totalNormalizationValues = state?.viewer?.totalNormalizationValues || [];
                            const normalizer = getNormalizationValue(state);
                            const { total = 1 } = totalNormalizationValues.find((entry) => entry.value === normalizer.value) || {};
                            const chart = responseToMainChart({
                                response,
                                categories,
                                dateFormat: viewerConfig?.date?.format,
                                total,
                                normalizer
                            });
                            return chart;
                        })
                })
            )
                .switchMap((chart) => {
                    return Observable.of(
                        setChartValues(chart)
                    );
                })
                .catch((error) => {
                    return Observable.of(
                        setSectionError(RequestId.CHART, { msgId: 'error.chart', message: error?.message })
                    );
                })
                .startWith(loadingSection(RequestId.CHART));
        });

/**
 * create all the layers needed for the current selected map visualization
 */
export const mgUpdateMapVisualizationEpic = (action$, store) =>
    action$.ofType(INIT_VIEWER, LOCATION_CHANGE)
        .filter(action => action.type === INIT_VIEWER
            || !action?.payload?.isFirstRendering)
        .switchMap((action) => {
            const state = store.getState();
            const layers = (state?.layers?.flat || []).filter(layer => layer.group === MAP_VIZ_LAYER_GROUP);
            const location = action?.payload?.location || state?.router?.location;
            const queryParams = getHashQueryParameters(location);
            const viewerConfig = getConfigProp('viewerConfig');
            const mapVisualizations = viewerConfig.mapVisualizations || [];
            const mapViz = mapVisualizations.find(({ id }) => id === queryParams['map-viz']) || mapVisualizations[0];
            const dateRange = getDateRange(state);
            const query = {
                ...queryParams,
                from: dateRange.from.formatValue,
                to: dateRange.to.formatValue
            };
            return Observable.concat(
                Observable.of(
                    ...layers.map((layer) => removeLayer(layer.id))
                ),
                Observable.defer(() =>
                    memoizeRequest({
                        id: RequestId.MAP,
                        location,
                        request: () => Promise.all([
                            ...mapViz.layers.map((layer, idx) => {
                                const viewParamsMap = layer?.viewParamsMap || {};
                                const viewparams = Object.keys(viewParamsMap)
                                    .reduce((acc, key) => {
                                        const targetKey = viewParamsMap[key];
                                        const value = !query[key]
                                            ? undefined
                                            : key === 'category'
                                                ? castArray(query[key]).map(val => `'${val}'`).join('\\,') // add backslash to escape commas
                                                : query[key];
                                        return query[key] ? `${acc}${targetKey}:${value};` : acc;
                                    }, layer?.params?.viewparams || '');
                                return getLayerConfig({
                                    store,
                                    layer,
                                    params: viewparams ? { viewparams } : {},
                                    overrideOptions: (options) => ({
                                        ...options,
                                        id: MAP_VIZ_LAYER_GROUP + '-' + idx,
                                        group: MAP_VIZ_LAYER_GROUP
                                    })
                                });
                            })
                        ])
                    })
                )
                    .switchMap((layersConfigs) => {
                        return Observable.of(
                            ...layersConfigs.map((layerConfig) => addLayer(layerConfig))
                        );
                    }));
        });

/**
 */
export const mgHighlightFeatureEpic = (action$, store) =>
    action$.ofType(LOCATION_CHANGE)
        .filter(action => action.type === INIT_VIEWER
            || !action?.payload?.isFirstRendering && !isQueryEqual(store.getState(), ['feature']))
        .switchMap((action) => {
            const state = store.getState();
            const location = action?.payload?.location || state?.router?.location;
            const baseLayer = applyStyleToBaseLayer(
                (state?.layers?.flat || []).find(layer => layer.group === BASE_LAYER_GROUP) || {},
                location
            );
            return Observable.of(
                updateNode(baseLayer.id, 'layer', {
                    features: baseLayer.features
                })
            );
        });

/**
 * request all needed information to create the table of features
 */
export const mgUpdateTableDataContentEpic = (action$, store) =>
    action$.ofType(INIT_VIEWER, LOCATION_CHANGE)
        .filter(action => !action?.payload?.isFirstRendering)
        .switchMap((action) => {
            const state = store.getState();
            const location = action?.payload?.location || state?.router?.location;
            const viewerConfig = getConfigProp('viewerConfig');
            const wpsUrl = getWPSURL(viewerConfig.url, {
                REQUEST: 'Execute',
                version: '1.0.0'
            });
            const categoryKey = viewerConfig?.category?.key;
            const wpsFeatureTypeName = viewerConfig.featureTypeName;
            const featureKey = viewerConfig?.feature?.key;
            const regionLayerKey = viewerConfig?.feature?.layer?.key;
            const dateKey = viewerConfig?.date?.key;
            const queryParams = getHashQueryParameters(location);
            const categories = castArray(queryParams.category || []);
            const dateType = viewerConfig?.date?.type;
            const dateRange = getDateRange(state);
            return Observable.defer(() =>
                memoizeRequest({
                    id: RequestId.TABLE,
                    location,
                    request: () => aggregate(wpsUrl, {
                        featureType: wpsFeatureTypeName,
                        aggregationAttribute: '',
                        aggregateFunction: 'Count',
                        groupByAttributes: categories.length > 0
                            ? [featureKey, categoryKey]
                            : featureKey,
                        filter: getFilter({
                            ...(categories.length > 0 && {
                                category: {
                                    key: categoryKey,
                                    value: categories,
                                    type: viewerConfig?.category?.type
                                }
                            }),
                            date: {
                                key: dateKey,
                                value: {
                                    from: dateRange.from.formatValue,
                                    to: dateRange.to.formatValue
                                },
                                type: dateType
                            }
                        })
                    }).toPromise()
                        .then((response) => {
                            const categoriesInfo = getCategoriesInfo(state);
                            const normalizer = getNormalizationValue(state);
                            const featuresInfo = state?.viewer?.features || [];
                            const table = responseToTable({
                                response,
                                categories,
                                featureKey,
                                regionLayerKey,
                                featureLabelKey: viewerConfig?.feature?.labelKey,
                                categoriesInfo,
                                featuresInfo,
                                defaultChartColor: viewerConfig.defaultChartColor,
                                normalizer,
                                messages: state?.locale?.messages
                            });
                            return table;
                        })
                })
            )
                .switchMap((table) => {
                    return Observable.of(setTableValues(table));
                })
                .catch((error) => {
                    return Observable.of(
                        setSectionError(RequestId.TABLE, { msgId: 'error.table', message: error?.message })
                    );
                })
                .startWith(loadingSection(RequestId.TABLE));
        });

/**
 * request all needed information to create the table of features
 */
export const mgFeaturesDetailsContentEpic = (action$, store) =>
    action$.ofType(INIT_VIEWER, LOCATION_CHANGE)
        .filter(action => !action?.payload?.isFirstRendering)
        .switchMap((action) => {
            const state = store.getState();
            const location = action?.payload?.location || state?.router?.location;
            const queryParams = getHashQueryParameters(location);
            const features = castArray(queryParams.feature || []);
            if (features.length === 0) {
                return Observable.of(setDetailValues({}));
            }
            const dateRange = getDateRange(state);
            const viewerConfig = getConfigProp('viewerConfig');
            const wpsUrl = getWPSURL(viewerConfig.url, {
                REQUEST: 'Execute',
                version: '1.0.0'
            });
            const wpsFeatureTypeName = viewerConfig.featureTypeName;
            const categories = castArray(queryParams.category || []);
            const featureKey = viewerConfig?.feature?.key;
            const regionLayerKey = viewerConfig?.feature?.layer?.key;
            const dateKey = viewerConfig?.date?.key;
            const categoryKey = viewerConfig?.category?.key;
            const dateType = viewerConfig?.date?.type;
            const featureGroup = viewerConfig?.feature?.group;
            return Observable.defer(() =>
                memoizeRequest({
                    id: RequestId.DETAILS,
                    location,
                    request: () => Promise.all([
                        // counter and bar chart
                        aggregate(wpsUrl, {
                            featureType: wpsFeatureTypeName,
                            aggregationAttribute: '',
                            aggregateFunction: 'Count',
                            groupByAttributes: featureGroup
                                ? [featureGroup, featureKey, categoryKey]
                                : [featureKey, categoryKey],
                            filter: getFilter({
                                ...(categories.length > 0 && {
                                    category: {
                                        key: categoryKey,
                                        value: categories,
                                        type: viewerConfig?.category?.type
                                    }
                                }),
                                date: {
                                    key: dateKey,
                                    value: {
                                        from: dateRange.from.formatValue,
                                        to: dateRange.to.formatValue
                                    },
                                    type: dateType
                                }
                            })
                        }).toPromise(),
                        // line chart
                        aggregate(wpsUrl, {
                            featureType: wpsFeatureTypeName,
                            aggregationAttribute: '',
                            aggregateFunction: 'Count',
                            groupByAttributes: categories.length > 0
                                ? [featureKey, dateKey, categoryKey]
                                : [featureKey, dateKey],
                            filter: getFilter({
                                ...(categories.length > 0 && {
                                    category: {
                                        key: categoryKey,
                                        value: categories,
                                        type: viewerConfig?.category?.type
                                    }
                                }),
                                feature: {
                                    key: viewerConfig?.feature?.key,
                                    value: features,
                                    type: viewerConfig?.feature?.type
                                }
                            })
                        }).toPromise()
                    ])
                        .then((response) => {
                            const normalizer = getNormalizationValue(state);
                            const featuresInfo = state?.viewer?.features || [];
                            const totalFeatureGroup = state?.viewer?.totalFeatureGroup;
                            const categoriesInfo = getCategoriesInfo(state);
                            const detail = responseToFeaturesDetail({
                                response,
                                features,
                                categories,
                                categoriesInfo,
                                dateFormat: viewerConfig?.date?.format,
                                defaultChartColor: viewerConfig.defaultChartColor,
                                normalizer,
                                featuresInfo,
                                regionLayerKey,
                                featureGroup,
                                totalFeatureGroup,
                                messages: state?.locale?.messages
                            });
                            return detail;
                        })
                })
            )
                .switchMap((detail) => {
                    return Observable.of(setDetailValues(detail));
                })
                .catch((error) => {
                    return Observable.of(
                        setSectionError(RequestId.DETAILS, { msgId: 'error.details', message: error?.message })
                    );
                })
                .startWith(loadingSection(RequestId.DETAILS));
        });

/**
 * store the query in the redux state on every update of location
 * so it is possible to compare the previous query with the current one
 */
export const mgStoreQueryEpic = (action$) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap((action) => {
            const location = action?.payload?.location;
            const query = getHashQueryParameters(location);
            return Observable.of(setPreviousQuery(query));
        });

export default {
    initAppEpic,
    mgUpdateMainChartDataContentEpic,
    mgUpdateTotalCountersDataContentEpic,
    mgUpdateMapVisualizationEpic,
    mgUpdateTableDataContentEpic,
    mgFeaturesDetailsContentEpic,
    mgHighlightFeatureEpic,

    mgStoreQueryEpic // must be the last epic to store the current query information
};
