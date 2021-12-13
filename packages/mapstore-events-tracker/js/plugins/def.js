/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// framework plugins
import MapPlugin from '@mapstore/framework/plugins/Map';
import SearchPlugin from '@mapstore/framework/plugins/Search';
import ToolbarPlugin from '@mapstore/framework/plugins/Toolbar';
import ZoomInPlugin from '@mapstore/framework/plugins/ZoomIn';
import ZoomOutPlugin from '@mapstore/framework/plugins/ZoomOut';

// custom plugins
import ChartPlugin from '@js/plugins/Chart';
import CountersPlugin from '@js/plugins/Counters';
import NormalizerPlugin from '@js/plugins/Normalizer';
import DateFilterPlugin from '@js/plugins/DateFilter';
import FeaturesPanelPlugin from '@js/plugins/FeaturesPanel';
import FooterPlugin from '@js/plugins/Footer';
import HeaderPlugin from '@js/plugins/Header';
import MapInteractionPlugin from '@js/plugins/MapInteraction';
import MapVisualizationPlugin from '@js/plugins/MapVisualization';
import OverlayPanelPlugin from '@js/plugins/OverlayPanel';
import VectorLegend from '@js/plugins/VectorLegend';
import ViewerLayoutPlugin from '@js/plugins/ViewerLayout';
import MenuPlugin from '@js/plugins/Menu';
import SharePlugin from '@js/plugins/Share';
import ThemeVariantSwitchPlugin from '@js/plugins/ThemeVariantSwitch';
import DownloadPlugin from '@js/plugins/Download';
import DataAttributionPlugin from '@js/plugins/DataAttribution';

// list of all the plugins and requires available for the application
export const plugins = {
    ChartPlugin,
    NormalizerPlugin,
    CountersPlugin,
    FeaturesPanelPlugin,
    DateFilterPlugin,
    FooterPlugin,
    HeaderPlugin,
    MapPlugin,
    MapInteractionPlugin,
    MapVisualizationPlugin,
    OverlayPanelPlugin,
    SearchPlugin,
    ToolbarPlugin,
    VectorLegend,
    ViewerLayoutPlugin,
    ZoomInPlugin,
    ZoomOutPlugin,
    MenuPlugin,
    SharePlugin,
    ThemeVariantSwitchPlugin,
    DownloadPlugin,
    DataAttributionPlugin
};

// the requires are javascript functions, component or object
// that could be used inside the localConfig cfg object within an expression
// with the structure {context.myKeyFunction} or {context.MyKeyComponent}
export const requires = {};

export default {
    plugins,
    requires
};
