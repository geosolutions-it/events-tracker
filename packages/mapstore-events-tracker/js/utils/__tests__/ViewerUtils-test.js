/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import moment from 'moment';
import {
    getFilter,
    computeClassifiedFeatures,
    responseToMainChart,
    responseToTable
} from '../ViewerUtils';

describe('ViewerUtils', () => {
    it('getFilter', () => {
        expect(getFilter()).toBe('');
        expect(getFilter({
            category: {
                key: 'type',
                value: ['CAT-1', 'CAT-2'],
                type: 'string'
            }
        })).toBe(
            '<ogc:And>' +
                '<ogc:Or>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>type</ogc:PropertyName>' +
                        '<ogc:Literal>CAT-1</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>type</ogc:PropertyName>' +
                        '<ogc:Literal>CAT-2</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                '</ogc:Or>' +
            '</ogc:And>'
        );
        expect(getFilter({
            date: {
                key: 'mo',
                value: {
                    from: '202101',
                    to: '202102'
                },
                type: 'string'
            }
        })).toBe(
            '<ogc:And>' +
                '<ogc:PropertyIsGreaterThanOrEqualTo>' +
                    '<ogc:PropertyName>mo</ogc:PropertyName>' +
                    '<ogc:Literal>*202101*</ogc:Literal>' +
                '</ogc:PropertyIsGreaterThanOrEqualTo>' +
                '<ogc:PropertyIsLessThanOrEqualTo>' +
                    '<ogc:PropertyName>mo</ogc:PropertyName>' +
                    '<ogc:Literal>*202102*</ogc:Literal>' +
                '</ogc:PropertyIsLessThanOrEqualTo>' +
            '</ogc:And>'
        );
        expect(getFilter({
            category: {
                key: 'type',
                value: ['CAT-1', 'CAT-2'],
                type: 'string'
            },
            date: {
                key: 'mo',
                value: {
                    from: '202101',
                    to: '202102'
                },
                type: 'string'
            }
        })).toBe(
            '<ogc:And>' +
                '<ogc:PropertyIsGreaterThanOrEqualTo>' +
                    '<ogc:PropertyName>mo</ogc:PropertyName>' +
                    '<ogc:Literal>*202101*</ogc:Literal>' +
                '</ogc:PropertyIsGreaterThanOrEqualTo>' +
                '<ogc:PropertyIsLessThanOrEqualTo>' +
                    '<ogc:PropertyName>mo</ogc:PropertyName>' +
                    '<ogc:Literal>*202102*</ogc:Literal>' +
                '</ogc:PropertyIsLessThanOrEqualTo>' +
                '<ogc:Or>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>type</ogc:PropertyName>' +
                        '<ogc:Literal>CAT-1</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>type</ogc:PropertyName>' +
                        '<ogc:Literal>CAT-2</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                '</ogc:Or>' +
            '</ogc:And>'
        );

        expect(getFilter({
            category: {
                key: 'type',
                value: ['CAT-1', 'CAT-2'],
                type: 'string'
            },
            date: {
                key: 'mo',
                value: {
                    from: '202101',
                    to: '202102'
                },
                type: 'string'
            },
            feature: {
                key: 'ar',
                value: [1, 5],
                type: 'number'
            }
        })).toBe(
            '<ogc:And>' +
                '<ogc:PropertyIsGreaterThanOrEqualTo>' +
                    '<ogc:PropertyName>mo</ogc:PropertyName>' +
                    '<ogc:Literal>*202101*</ogc:Literal>' +
                '</ogc:PropertyIsGreaterThanOrEqualTo>' +
                '<ogc:PropertyIsLessThanOrEqualTo>' +
                    '<ogc:PropertyName>mo</ogc:PropertyName>' +
                    '<ogc:Literal>*202102*</ogc:Literal>' +
                '</ogc:PropertyIsLessThanOrEqualTo>' +
                '<ogc:Or>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>type</ogc:PropertyName>' +
                        '<ogc:Literal>CAT-1</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>type</ogc:PropertyName>' +
                        '<ogc:Literal>CAT-2</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                '</ogc:Or>' +
                '<ogc:Or>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>ar</ogc:PropertyName>' +
                        '<ogc:Literal>1</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                    '<ogc:PropertyIsEqualTo>' +
                        '<ogc:PropertyName>ar</ogc:PropertyName>' +
                        '<ogc:Literal>5</ogc:Literal>' +
                    '</ogc:PropertyIsEqualTo>' +
                '</ogc:Or>' +
            '</ogc:And>'
        );
    });
    it('computeClassifiedFeatures', () => {
        const features = [
            {
                type: 'Feature',
                properties: {
                    count: 500
                },
                geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]}
            },
            {
                type: 'Feature',
                properties: {
                    count: 10
                },
                geometry: {type: "Polygon", coordinates: [[[1, 0], [1, 1], [2, 1], [1, 0]]]}
            },
            {
                type: 'Feature',
                properties: {
                    count: 100
                },
                geometry: {type: "Polygon", coordinates: [[[2, 0], [2, 1], [3, 1], [2, 0]]]}
            }
        ];
        expect(computeClassifiedFeatures({
            features,
            classification: {
                labelId: 'countMessage',
                type: "scaleQuantile",
                domain: 'count',
                domainExtent: false,
                normalize: true,
                range: [
                    '#fef6ee',
                    '#fec69d',
                    '#d29a81'
                ],
                stylePropertyKey: 'fillColor'
            }
        })).toEqual([
            {
                type: 'Feature',
                properties: { count: 500, area: 6195699951.035552, normalizedCount: 500 },
                geometry: {type: "Polygon", coordinates: [[[0, 0], [0, 1], [1, 1], [0, 0]]]},
                style: { fillColor: '#d29a81' }
            },
            {
                type: 'Feature',
                properties: { count: 10, area: 6195699951.035552, normalizedCount: 10 },
                geometry: {type: "Polygon", coordinates: [[[1, 0], [1, 1], [2, 1], [1, 0]]]},
                style: { fillColor: '#fef6ee' }
            },
            {
                type: 'Feature',
                properties: { count: 100, area: 6195699951.035551, normalizedCount: 100 },
                geometry: {type: "Polygon", coordinates: [[[2, 0], [2, 1], [3, 1], [2, 0]]]},
                style: { fillColor: '#fec69d' }
            }
        ]);
    });

    it('responseToMainChart', () => {
        const response = {
            AggregationResults: [
                [202002, 'CAT-1', 20],
                [202101, 'CAT-1', 12],
                [202004, 'CAT-1', 50],
                [202006, 'CAT-1', 70]
            ]
        };
        const mainChart = responseToMainChart({
            response,
            categories: ['CAT-1'],
            dateFormat: "YYYYMM"
        });
        // TODO: dates need to be in local timezone
        expect(mainChart.xLabelId).toBe('msEventsTracker.labels.month');
        expect(mainChart.yLabelId).toBe(undefined);
        expect(mainChart.data.length).toBe(1);
        expect(mainChart.data[0].category).toBe('CAT-1');
        expect(mainChart.data[0].y).toEqual([
            20,
            50,
            70,
            12
        ]);
        expect(mainChart.data[0].x.map((isoDate) => moment(isoDate).isValid())).toEqual([
            true,
            true,
            true,
            true
        ]);
    });

    it('responseToTable', () => {
        const response = {
            AggregationResults: [
                [1, 'CAT-1', 100],
                [2, 'CAT-1', 70],
                [7, 'CAT-1', 10]
            ]
        };
        const table = responseToTable({
            featureKey: 'area',
            featureLabelKey: 'name',
            regionLayerKey: 'area',
            categories: ['CAT-1'],
            categoriesInfo: [{
                labelId: "cat1",
                value: "CAT-1",
                color: '#ff0000'
            }],
            defaultChartColor: "#333333",
            featuresInfo: [{
                properties: { area: '1', name: 'label1' }
            }, {
                properties: { area: '2', name: 'label2' }
            }, {
                properties: { area: '7', name: 'label7' }
            }],
            response
        });
        expect(table).toEqual({
            ranges: {
                'CAT-1': { min: 10, max: 100, color: '#ff0000' }
            },
            cols: [
                { value: 'area', labelId: 'msEventsTracker.area' },
                { color: '#ff0000', labelId: 'cat1', value: 'CAT-1' }
            ],
            rows: [
                { area: { value: '1', label: '1msEventsTracker.tableRowName' }, 'CAT-1': 100 },
                { area: { value: '2', label: '2msEventsTracker.tableRowName' }, 'CAT-1': 70 },
                { area: { value: '7', label: '7msEventsTracker.tableRowName' }, 'CAT-1': 10 }
            ]
        });
    });
});
