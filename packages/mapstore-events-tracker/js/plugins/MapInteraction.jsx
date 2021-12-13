/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import {
    getMapVisualizationLayers,
    getMapBaseLayer,
    getViewerCategories
} from '@js/selectors/viewer';
import { getHashQueryParameters } from '@js/utils/LocationUtils';
import { withResizeDetector } from 'react-resize-detector';
import OLPointerMoveFeaturesPopup from '@js/components/OLPointerMoveFeaturesPopup';
import OLFeaturesPopup from '@js/components/OLFeaturesPopup';
import PopupFields from '@js/components/PopupFields';

const interactionsSupport = {
    openlayers: function Support({
        map,
        layers,
        baseLayer,
        mapViz,
        width,
        location,
        categories,
        disablePointerMove
    }) {

        const [popups, setPopups] = useState([]);

        // remove the popup when the map visualization change
        useEffect(() => {
            setPopups([]);
        }, [mapViz]);

        return (
            <>
                <OLFeaturesPopup
                    map={map}
                    popups={popups}
                    layers={layers}
                    baseLayer={baseLayer}
                    onChange={(newPopups) => setPopups(newPopups)}
                    popupComponent={PopupFields}
                    location={location}
                    categories={categories}
                />
                {!disablePointerMove &&
                <OLPointerMoveFeaturesPopup
                    map={map}
                    width={width}
                    layers={layers}
                    disabled={popups.length > 0}
                    popupComponent={PopupFields}
                />}
            </>
        );
    }
};

/**
 * Map interaction related to popups
 * @prop {object} cfg.disablePointerMove disable pointer move functionalities
 * @memberof plugins
 */
function MapInteractionTool({
    mapType,
    ...props
}) {
    const Support = interactionsSupport[mapType];
    return Support ? <Support {...props} /> : null;
}

const ConnectedMapInteractionTool = connect(
    createSelector([
        getMapVisualizationLayers,
        getMapBaseLayer,
        state => state?.router?.location,
        getViewerCategories
    ], (layers, baseLayer, location, categories) => ({
        layers,
        baseLayer,
        mapViz: getHashQueryParameters(location)?.['map-viz'] || '',
        location,
        categories
    })),
    {}
)(withResizeDetector(MapInteractionTool));

export default createPlugin('MapInteraction', {
    // placeholder component
    component: function MapInteraction({}) {
        return null;
    },
    containers: {
        Map: {
            name: 'MapInteraction',
            Tool: ConnectedMapInteractionTool,
            priority: 1
        }
    },
    reducers: {},
    epics: {}
});
