/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import { groupFeatureByProperty } from '../LayerUtils';

describe('LayerUtils', () => {
    it('groupFeatureByProperty should not group features if layerGroupBy argument is missing', () => {
        const features = [];
        const newFeatures = groupFeatureByProperty(features);
        expect(newFeatures).toBe(features);
    });
    it('groupFeatureByProperty should group features if layerGroupBy argument is available', () => {
        const features = [
            {
                geometry: null,
                id: 'layer.1.CATEGORY_1',
                properties: {
                    x: 0,
                    y: 0,
                    count: 2,
                    type: 'CATEGORY_1'
                }
            },
            {
                geometry: null,
                id: 'layer.1.CATEGORY_2',
                properties: {
                    x: 0,
                    y: 0,
                    count: 3,
                    type: 'CATEGORY_2'
                }
            },
            {
                geometry: null,
                id: 'layer.2.CATEGORY_1',
                properties: {
                    x: 1,
                    y: 0,
                    count: 1,
                    type: 'CATEGORY_1'
                }
            }
        ];
        const layerGroupBy = {
            keys: ['x', 'y'],
            categoryKey: 'type',
            valueKey: 'count'
        };
        const newFeatures = groupFeatureByProperty(features, layerGroupBy);
        expect(newFeatures).toEqual([
            {
                geometry: null,
                id: 'layer.1.',
                properties: {
                    x: 0,
                    y: 0,
                    count: 5,
                    type: {
                        CATEGORY_1: 2,
                        CATEGORY_2: 3
                    }
                }
            },
            {
                geometry: null,
                id: 'layer.2.',
                properties: {
                    count: 1,
                    x: 1,
                    y: 0,
                    type: {
                        CATEGORY_1: 1
                    }
                }
            }
        ]);
    });
});
