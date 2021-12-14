/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import groupBy from 'lodash/groupBy';

export const BASE_LAYER_GROUP = 'BASE';
export const MAP_VIZ_LAYER_GROUP = 'MAP-VIZ';

/**
 * groups the feature of a layer based on a key and accumulate categories in the same property
 * @prop {array} features array of GeoJSON features
 * @prop {object} layerGroupBy group by options
 * @prop {array} layerGroupBy.keys array of properties keys to use as unique identifier
 * @param {string} layerGroupBy.categoryKey the key of the property that represent the category (should match viewerConfig.category.key)
 * @param {array} layerGroupBy.valueKey the key of the property that represent the count associated to the category
 * @returns grouped array of features
 */

export function groupFeatureByProperty(features, layerGroupBy) {
    if (!features || !layerGroupBy) {
        return features;
    }
    const { keys, valueKey, categoryKey } = layerGroupBy;
    const groupedFeaturesByKey = groupBy(features, ({ properties }) => keys.map(key => properties[key]).join());
    return Object.keys(groupedFeaturesByKey).map((key) => {
        const group = groupedFeaturesByKey[key];
        return group.reduce((acc, feature) => {
            const categoryName = feature.properties[categoryKey];
            const categoryCount = feature.properties[valueKey] || 0;
            const sumCount = acc?.properties?.[valueKey] || 0;
            return {
                ...acc,
                ...feature,
                id: feature.id.replace(categoryName, ''),
                properties: {
                    ...feature.properties,
                    [valueKey]: sumCount + categoryCount,
                    [categoryKey]: {
                        ...acc?.properties?.[categoryKey],
                        [categoryName]: categoryCount
                    }
                }
            };
        }, {});
    });
}
