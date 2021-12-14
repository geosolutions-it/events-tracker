

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
    getViewerCategories,
    getDateRange,
    getMainChartData,
    getMainChartShapes,
    getTableData,
    getCategoriesInfo,
    getMapVisualization,
    getMapVisualizationLayers,
    getMapVisualizationOptions,
    isQueryEqual,
    getMapBaseLayer
} from '../viewer';
import { setConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import {
    MAP_VIZ_LAYER_GROUP,
    BASE_LAYER_GROUP
} from '@js/utils/LayerUtils';

describe('viewer selectors', () => {
    afterEach(() => {
        setConfigProp('viewerConfig', undefined);
    });
    it('getViewerCategories', () => {
        const state = {
            viewer: {
                categories: [{
                    value: 'CAT-1',
                    color: '#ff0000',
                    labelId: 'cat1'
                }, {
                    value: 'CAT-2',
                    color: '#0000ff',
                    labelId: 'cat2'
                }],
                counters: [{
                    category: "CAT-1",
                    count: 100
                }, {
                    category: "CAT-2",
                    count: 50
                }]
            },
            router: {
                location: {
                    search: '?category=CAT-1'
                }
            }
        };
        const categories = getViewerCategories(state);
        expect(categories).toEqual([
            {
                id: 'cat1',
                labelId: 'cat1',
                value: 'CAT-1',
                count: 100,
                color: '#ff0000',
                selected: true,
                href: '#'
            },
            {
                id: 'cat2',
                labelId: 'cat2',
                value: 'CAT-2',
                count: 50,
                color: '#0000ff',
                selected: false,
                href: '#?category=CAT-1&category=CAT-2'
            }
        ]);
    });
    it('getDateRange from default values', () => {
        const state = {
            viewer: {
                datesRange: {
                    from: '202001',
                    to: '202101'
                }
            }
        };
        const dateRange = getDateRange(state);
        expect(dateRange.from.formatValue).toBe('202012');
        expect(dateRange.to.formatValue).toBe('202101');
    });
    it('getDateRange from query', () => {
        const state = {
            viewer: {
                datesRange: {
                    from: '202001',
                    to: '202101'
                }
            },
            router: {
                location: {
                    search: '?from=202011&to=202012'
                }
            }
        };
        const dateRange = getDateRange(state);
        expect(dateRange.from.formatValue).toBe('202011');
        expect(dateRange.to.formatValue).toBe('202012');
    });
    it('getMainChartData', () => {
        const state = {
            viewer: {
                categories: [{
                    value: 'CAT-1',
                    color: '#ff0000',
                    labelId: 'cat1'
                }, {
                    value: 'CAT-2',
                    color: '#0000ff',
                    labelId: 'cat2'
                }],
                chart: {
                    xLabelId: 'month',
                    yLabelId: 'dataPoint',
                    data: [{
                        category: 'CAT-1',
                        x: ['202011', '202012'],
                        y: [0, 1]
                    }]
                }
            }
        };
        const charts = getMainChartData(state);
        expect(charts).toEqual({
            xLabelId: 'month',
            yLabelId: 'dataPoint',
            data: [{
                category: 'CAT-1',
                x: ['202011', '202012'],
                y: [0, 1],
                mode: 'lines',
                line: {
                    color: '#ff0000',
                    width: 2
                },
                name: 'cat1'
            }]
        });
    });
    it('getMainChartShapes', () => {
        const state = {
            viewer: {
                datesRange: {
                    from: '202001',
                    to: '202101'
                }
            },
            router: {
                location: {
                    search: '?from=202011&to=202012'
                }
            }
        };
        const shapes = getMainChartShapes(state);

        expect(shapes.length).toBe(3);

        expect(moment(shapes[0].x0).isValid()).toBe(true);
        expect(moment(shapes[0].x1).isValid()).toBe(true);

        expect(moment(shapes[1].x0).isValid()).toBe(true);
        expect(moment(shapes[1].x1).isValid()).toBe(true);

        expect(moment(shapes[2].x0).isValid()).toBe(true);
        expect(moment(shapes[2].x1).isValid()).toBe(true);

        expect(shapes.map(({ x0, x1, ...shape }) => shape)).toEqual([
            {
                type: 'rect',
                xref: 'x',
                yref: 'paper',
                fillcolor: '#d3d3d3',
                opacity: 0.2,
                y0: 0,
                y1: 1,
                line: {
                    width: 0
                }
            },
            {
                type: 'line',
                xref: 'x',
                yref: 'paper',
                y0: 0,
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
                y0: 0,
                y1: 1,
                line: {
                    color: '#333333',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]);
    });

    it('getTableData', () => {
        const state = {
            viewer: {
                table: {
                    rows: [
                        { feature: "1", '*': 100 },
                        { feature: "2", '*': 0 }
                    ],
                    cols: [
                        { value: "feature", labelId: "feature" },
                        { value: "*", labelId: "msEventsTracker.categories.all", color: "#333333" }
                    ],
                    ranges: {
                        '*': {
                            color: "#333333",
                            max: 100,
                            min: 0
                        }
                    }
                }
            },
            router: {
                location: {
                    search: '?feature=1'
                }
            }
        };
        const table = getTableData(state);
        expect(table).toEqual({
            rows: [
                {
                    feature: '1',
                    '*': 100,
                    '@props': {
                        selected: true,
                        selectedHref: '#'
                    }
                },
                {
                    feature: '2',
                    '*': 0,
                    '@props': {
                        selected: false,
                        selectedHref: '#?feature=1&feature=2'
                    }
                }
            ],
            cols: [
                {
                    value: 'feature',
                    labelId: 'feature'
                },
                {
                    value: '*',
                    labelId: 'msEventsTracker.categories.all',
                    color: '#333333'
                }
            ],
            ranges: {
                '*': {
                    color: '#333333',
                    max: 100,
                    min: 0
                }
            }
        });
    });
    it('getCategoriesInfo', () => {
        const state = {
            viewer: {
                categories: [{
                    value: 'CAT-1',
                    color: '#ff0000',
                    labelId: 'cat1'
                }, {
                    value: 'CAT-2',
                    color: '#0000ff',
                    labelId: 'cat2'
                }]
            }
        };
        const categories = getCategoriesInfo(state);
        expect(categories).toEqual([{
            value: 'CAT-1',
            color: '#ff0000',
            labelId: 'cat1'
        }, {
            value: 'CAT-2',
            color: '#0000ff',
            labelId: 'cat2'
        }]);
    });
    it('getMapVisualization', () => {
        setConfigProp('viewerConfig', {
            mapVisualizations: [{
                id: 'points',
                labelId: 'pointsMessage',
                layers: []
            }, {
                id: 'squares',
                labelId: 'squaresMessage',
                layers: []
            }]
        });
        const state = {
            viewer: {},
            router: {
                location: {
                    search: '?map-viz=squares'
                }
            }
        };
        const mapVisualization = getMapVisualization(state);
        expect(mapVisualization).toEqual({
            labelId: 'squaresMessage',
            value: 'squares',
            label: 'squaresMessage'
        });
    });
    it('getMapVisualizationLayers', () => {
        const state = {
            layers: {
                flat: [{
                    "format": "image/jpeg",
                    "group": "background",
                    "name": "osm:osm_simple_dark",
                    "opacity": 1,
                    "title": "OSM Simple Dark",
                    "thumbURL": "static/osm-simple-dark.jpg",
                    "type": "wms",
                    "url": [
                        "https://maps6.geosolutionsgroup.com/geoserver/wms",
                        "https://maps3.geosolutionsgroup.com/geoserver/wms",
                        "https://maps1.geosolutionsgroup.com/geoserver/wms",
                        "https://maps4.geosolutionsgroup.com/geoserver/wms",
                        "https://maps2.geosolutionsgroup.com/geoserver/wms",
                        "https://maps5.geosolutionsgroup.com/geoserver/wms"
                    ],
                    "source": "osm_simple_dark",
                    "visibility": false,
                    "singleTile": false,
                    "credits": {
                        "title": "OSM Simple Dark | Rendering <a href=\"https://www.geo-solutions.it/\">GeoSolutions</a> | Data © <a href=\"http://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"http://www.openstreetmap.org/copyright\">ODbL</a>"
                    }
                }, {
                    id: 'points',
                    type: 'vector',
                    features: [],
                    group: MAP_VIZ_LAYER_GROUP
                }]
            }
        };
        const layers = getMapVisualizationLayers(state);
        expect(layers).toEqual([{
            id: 'points',
            type: 'vector',
            features: [],
            group: MAP_VIZ_LAYER_GROUP
        }]);
    });
    it('getMapBaseLayer', () => {
        const state = {
            layers: {
                flat: [{
                    "format": "image/jpeg",
                    "group": "background",
                    "name": "osm:osm_simple_dark",
                    "opacity": 1,
                    "title": "OSM Simple Dark",
                    "thumbURL": "static/osm-simple-dark.jpg",
                    "type": "wms",
                    "url": [
                        "https://maps6.geosolutionsgroup.com/geoserver/wms",
                        "https://maps3.geosolutionsgroup.com/geoserver/wms",
                        "https://maps1.geosolutionsgroup.com/geoserver/wms",
                        "https://maps4.geosolutionsgroup.com/geoserver/wms",
                        "https://maps2.geosolutionsgroup.com/geoserver/wms",
                        "https://maps5.geosolutionsgroup.com/geoserver/wms"
                    ],
                    "source": "osm_simple_dark",
                    "visibility": false,
                    "singleTile": false,
                    "credits": {
                        "title": "OSM Simple Dark | Rendering <a href=\"https://www.geo-solutions.it/\">GeoSolutions</a> | Data © <a href=\"http://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"http://www.openstreetmap.org/copyright\">ODbL</a>"
                    }
                }, {
                    id: 'polygons',
                    type: 'vector',
                    features: [],
                    group: BASE_LAYER_GROUP
                }]
            }
        };
        const baseLayer = getMapBaseLayer(state);
        expect(baseLayer).toEqual({
            id: 'polygons',
            type: 'vector',
            features: [],
            group: BASE_LAYER_GROUP
        });
    });
    it('getMapVisualization', () => {
        setConfigProp('viewerConfig', {
            mapVisualizations: [{
                id: 'points',
                labelId: 'pointsMessage',
                layers: []
            }, {
                id: 'squares',
                labelId: 'squaresMessage',
                layers: []
            }]
        });
        const state = {
            viewer: {},
            router: {
                location: {
                    search: '?map-viz=squares'
                }
            }
        };
        const mapVisualizations = getMapVisualizationOptions(state);
        expect(mapVisualizations).toEqual([{
            value: 'points',
            labelId: 'pointsMessage',
            label: 'pointsMessage'
        }, {
            value: 'squares',
            labelId: 'squaresMessage',
            label: 'squaresMessage'
        }]);
    });
    it('isQueryEqual', () => {
        const state = {
            viewer: {
                previousQuery: {
                    'map-viz': 'points',
                    'category': 'CAT-1'
                }
            },
            router: {
                location: {
                    search: '?map-viz=squares&category=CAT-1'
                }
            }
        };
        expect(isQueryEqual(state, ['map-viz'])).toBe(false);
        expect(isQueryEqual(state, ['category'])).toBe(true);
        expect(isQueryEqual(state)).toBe(false);
    });
});
