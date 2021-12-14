/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { toOGCFilterParts } from '@mapstore/framework/utils/FilterUtils';
import castArray from 'lodash/castArray';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import chroma from 'chroma-js';
import * as d3Scale from 'd3-scale';
import min from 'lodash/min';
import max from 'lodash/max';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import moment from 'moment';
import turfArea from '@turf/area';
import { getMessageById } from '@mapstore/framework/utils/LocaleUtils';

/**
 * create an ogc filter to use in the WPS request
 * currently supports only category and date filter
 */
export const getFilter = ({ category, date, feature } = {}) => {
    if (!category && !date && !feature) {
        return '';
    }
    return toOGCFilterParts({
        filterFields: [
            ...castArray(category?.value || [])
                .map((val) => ({
                    groupId: 2,
                    attribute: category.key,
                    operator: "=",
                    type: category.type,
                    value: val
                })),
            ...(date?.value?.from
                ? [{
                    groupId: 1,
                    attribute: date.key,
                    operator: ">=",
                    type: date.type,
                    value: date.value.from
                }]
                : []),
            ...(date?.value?.to
                ? [{
                    groupId: 1,
                    attribute: date.key,
                    operator: "<=",
                    type: date.type,
                    value: date.value.to
                }]
                : []),
            ...castArray(feature?.value || [])
                .map((val) => ({
                    groupId: 3,
                    attribute: feature.key,
                    operator: "=",
                    type: feature.type,
                    value: val
                }))
        ],
        groupFields: [
            {
                id: 1,
                index: 0,
                logic: 'AND'
            },
            ...(category
                ? [{
                    id: 2,
                    index: 0,
                    logic: 'OR',
                    groupId: 1
                }]
                : []),
            ...(feature
                ? [{
                    id: 3,
                    index: 0,
                    logic: 'OR',
                    groupId: 1
                }]
                : [])
        ]
    }, '1.0.0', 'ogc')[0];
};

export function computeClassification({classification, features, normalizer}) {
    const multiplier = normalizer?.params?.multiplier || 1;
    if (classification && features) {
        const domainValues = features.map(feature => {
            const properties = feature.properties;
            if (classification.normalize) {
                if (feature.geometry) {
                    properties.area = turfArea(feature);
                }
                const denominator = properties[normalizer?.value] || 1;
                const normalizedCount = (properties[classification.domain] / denominator) * multiplier;
                properties[classification.normalizePropertyKey || 'normalizedCount'] = normalizedCount;
                return normalizedCount;
            }
            return properties[classification.domain];
        });
        const minDomain = min(domainValues);
        const maxDomain = max(domainValues);
        const range = isString(classification.range)
            ? chroma.scale(classification.range).colors(classification.rangeClasses || 5)
            : classification.range;
        const classificationType = classification.type || 'scaleQuantile';
        const scale = d3Scale[classificationType]()
            .domain(classification.domainExtent ? [minDomain, maxDomain] : domainValues)
            .range(range);
        const isContinuous = [
            'scaleQuantize',
            'scaleThreshold',
            'scaleQuantile'
        ].indexOf(classificationType) === -1;
        const options = {classification, minDomain, maxDomain, range, scale};
        let labelId = classification.labelId || normalizer.labelId;
        labelId = labelId && labelId !== 'msEventsTracker.prompts.normalByNone' ? labelId : 'msEventsTracker.dataPoints';
        if (isContinuous) {
            const stops = [...scale.range()].reverse();
            if (isNumber(stops[0])) {
                return {
                    ...options,
                    labelId: labelId,
                    type: 'circles',
                    value: [minDomain, maxDomain, stops]
                };
            }
            return {
                ...options,
                labelId,
                type: 'continuous',
                value: [minDomain, maxDomain, stops]
            };
        }
        return {
            ...options,
            labelId,
            type: 'classes',
            value: scale.range().map((value) => {
                return [ value, scale.invertExtent(value) ];
            })
        };
    }
    return {};
}

/**
 * compute the classification client side
 */
export function computeClassifiedFeatures({normalizer, classification, features, style}) {
    const classificationParams = computeClassification({normalizer, classification, features});
    if (classification && features) {
        const scale = classificationParams.scale;
        return features.map((feature) => {
            return {
                ...feature,
                style: {
                    ...style,
                    [classification.stylePropertyKey]: scale(classification.normalize
                        ? feature.properties[classification.normalizePropertyKey || 'normalizedCount']
                        : feature.properties[classification.domain])
                }
            };
        });
    }
    return features;
}

export const responseToMainChart = ({
    response,
    categories,
    dateFormat,
    total = 1,
    normalizer
}) => {
    const aggregationResults = response?.AggregationResults || [];
    const multiplier = normalizer?.params?.multiplier || 1;
    const chart = categories.length > 0
        ? categories.map((category) => {
            return {
                ...aggregationResults
                    .filter(result => result[1] === category)
                    .sort((a, b) => a[0] > b[0] ? 1 : -1)
                    .reduce((acc, entry) => {
                        const [date, categoryValue, count] = entry;
                        return {
                            ...acc,
                            category: categoryValue,
                            x: [
                                ...acc.x,
                                moment(date + '', dateFormat || 'YYYYMM').toISOString()
                            ],
                            y: [...acc.y, (count / total) * multiplier ]
                        };
                    }, {
                        x: [],
                        y: []
                    })
            };
        })
        : aggregationResults
            .sort((a, b) => a[0] > b[0] ? 1 : -1)
            .reduce((acc, entry) => {
                const [date, count] = entry;
                return {
                    ...acc,
                    id: 'msEventsTracker.categories.all',
                    x: [
                        ...acc.x,
                        moment(date + '', dateFormat || 'YYYYMM').toISOString()
                    ],
                    y: [...acc.y, (count / total) * multiplier ]
                };
            }, {
                x: [],
                y: []
            });
    return {
        data: castArray(chart),
        xLabelId: "msEventsTracker.labels.month",
        yLabelId: normalizer?.labelId
    };
};

export const responseToTable = ({
    response,
    categories,
    featureKey,
    regionLayerKey,
    featuresInfo,
    categoriesInfo,
    defaultChartColor,
    normalizer,
    messages
}) => {

    const aggregationResults = response?.AggregationResults || [];
    const resultsGroupedByFeatureKey = aggregationResults.reduce((acc, entry) => {
        if (categories.length > 0) {
            const [feature, category, count] = entry;
            return {
                ...acc,
                [feature]: {
                    ...acc[feature],
                    [category]: count
                }
            };
        }
        const [feature, count] = entry;
        return {
            ...acc,
            [feature]: {
                ...acc[feature],
                '*': count
            }
        };
    }, {});

    const multiplier = normalizer?.params?.multiplier || 1;
    const normalizerValue = normalizer?.value;

    const rows = featuresInfo.map(({ properties }) => {
        const key = properties[regionLayerKey];
        const total = properties[normalizerValue] || 1;
        const fields = resultsGroupedByFeatureKey[key];
        const normalizedCount = fields && Object.keys(fields)
            .reduce((acc, fieldKey) => {
                const count = fields[fieldKey];
                return {
                    ...acc,
                    [fieldKey]: (count / total) * multiplier
                };
            }, {});

        return {
            [featureKey]: { value: key, label: key + getMessageById(messages, 'msEventsTracker.tableRowName') },
            ...normalizedCount
        };
    });

    const cols = categories.length > 0
        ? [
            { value: featureKey, labelId: `msEventsTracker.${featureKey}` },
            ...categories.map((catKey) => {
                const { color, labelId } = categoriesInfo.find(category => category.value === catKey) || {};
                return {
                    color,
                    labelId,
                    value: catKey
                };
            })
        ]
        : [
            { value: featureKey, labelId: 'msEventsTracker.featureTypeName' },
            { value: '*', labelId: 'msEventsTracker.categories.all', color: defaultChartColor }
        ];

    const allValues = !(categories.length > 0)
        ? rows.map((row) => row['*'])
        : [];
    const ranges = categories.length > 0
        ? categories.reduce((acc, catKey) => {
            const values = rows.map((row) => row[catKey] || 0);
            const { color } = categoriesInfo.find(category => category.value === catKey) || {};
            return {
                ...acc,
                [catKey]: {
                    min: min(values),
                    max: max(values),
                    color
                }
            };
        }, {})
        : {
            '*': {
                min: min(allValues),
                max: max(allValues),
                color: defaultChartColor
            }
        };
    rows.sort((a, b) => {
        if (a[featureKey].value < b[featureKey].value) {
            return -1;
        }
        if (a[featureKey].value > b[featureKey].value) {
            return 1;
        }
        return 0;
    });
    return {
        ranges,
        cols,
        rows
    };
};

export const responseToFeaturesDetail = ({
    regionLayerKey,
    response,
    categories,
    categoriesInfo,
    features,
    featuresInfo,
    dateFormat,
    defaultChartColor,
    normalizer,
    totalFeatureGroup,
    messages,
    featureGroup
}) => {
    const [
        counterResponse,
        chartsResponse
    ] = response;


    const multiplier = normalizer?.params?.multiplier || 1;
    const normalizerValue = normalizer?.value;

    const counterAggregationResults = featureGroup
        ? (counterResponse?.AggregationResults || [])
        : (counterResponse?.AggregationResults || []).map(entry => [ '*', ...entry]);

    const filteredAggregateResultsBySelectedFeatures = counterAggregationResults.filter((entry) => features.indexOf(entry[1] + '') !== -1) || [];

    const selectedFeatures = featuresInfo.filter(feature => features.includes(feature.properties[regionLayerKey] + ''));

    const counterTotal = selectedFeatures
        .reduce((sum, feature) => sum + (feature?.properties?.[normalizerValue] || 0), 0) || 1;

    const selectedCategories = categories.length === 0
        ? categoriesInfo.map(({ value }) => value)
        : categories;

    const counters = selectedCategories.map((category) => {
        const count = filteredAggregateResultsBySelectedFeatures
            .filter((entry) => entry[2] === category)
            .reduce((sum, entry) => sum + (entry[3] || 0), 0);
        return { category, count: (count / counterTotal) * multiplier };
    });

    const { total: selectedTotalGroup } = totalFeatureGroup.find((entry) => entry.value === normalizer.value) || {};

    const featuresGroupsTotals = featureGroup
        ? uniq(selectedFeatures.map(({ properties }) => properties[featureGroup]))
            .map((group) => {
                const key = group + '';
                const count = counterAggregationResults
                    .filter(entry => (entry[0] + '') === key)
                    .reduce((sum, entry) => sum + (entry[3] || 0), 0);
                const total = selectedTotalGroup[key] || 1;
                return { group: key, count: (count / total) * multiplier };
            })
        : [{ group: '*' }];

    const selectedFeaturesTotals = selectedFeatures.map(({ properties }) => {
        const key = (properties[regionLayerKey] + '');
        const count = counterAggregationResults
            .filter(entry => (entry[1] + '') === key)
            .reduce((sum, entry) => sum + (entry[3] || 0), 0);
        const total = properties[normalizerValue] || 1;
        return { feature: key, count: (count / total) * multiplier, group: featureGroup ? (properties[featureGroup] + '') : '*' };
    });

    const barCharts = featuresGroupsTotals
        .map(({ group, count }) => {
            const selectedFeaturesTotalsByGroup = selectedFeaturesTotals.filter((entry) => entry.group === group);
            const xValues = [
                ...selectedFeaturesTotalsByGroup.map(entry => entry.feature + ' ' + getMessageById(messages, 'msEventsTracker.feature')),
                ...(featureGroup ? [getMessageById(messages, 'msEventsTracker.featureGroups.group-' + group)] : [])
            ];
            const yValue = [
                ...selectedFeaturesTotalsByGroup.map(entry => entry.count),
                ...(featureGroup ? [count] : [])
            ];
            return {
                yBarLabelId: normalizer.labelId || 'dataPoints',
                data: {
                    name: 'Count',
                    x: xValues,
                    y: yValue,
                    text: yValue.map((y) => y + ''),
                    hoverinfo: 'none',
                    textposition: 'auto',
                    marker: {
                        color: defaultChartColor
                    }
                }
            };
        });

    const barChartMax = max(flatten(barCharts.map(({ y }) => y)));

    const lineCharts = selectedFeatures.map(({ properties }) => {
        const key = (properties?.[regionLayerKey] + '');
        const AggregationResults = chartsResponse?.AggregationResults
            .filter((entry) => (entry[0] + '') === key)
            .map(entry => entry.filter((val, idx) => idx > 0));
        const chart = responseToMainChart({
            response: { AggregationResults },
            categories,
            dateFormat,
            total: properties[normalizerValue] || 1,
            normalizer
        });
        return {
            ...chart,
            feature: key
        };
    });

    const lineChartMax = max(
        flatten(
            lineCharts.map(lineChart =>
                flatten(lineChart?.data?.map(({ y }) => y))
            )
        )
    );
    return {
        barCharts,
        barChartRange: [0, barChartMax],
        lineCharts,
        lineChartRange: [0, lineChartMax],
        counters
    };
};
