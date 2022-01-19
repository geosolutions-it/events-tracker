/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import castArray from 'lodash/castArray';
import PopupSupport from '@mapstore/framework/components/map/openlayers/PopupSupport';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import {
    hashLocationToHref,
    getHashQueryParameters
} from '@js/utils/LocationUtils';
import PopupFields from '@js/components/PopupFields';
import { getMessageById } from '@mapstore/framework/utils/LocaleUtils';

/**
 * Map popup that shows the current selected feature based on the map visualization
 * with some information related to selected categories
 * @name OLFeaturesPopup
 * @memberof components
 * @param {ol.Map} map a instance of OpenLayers map
 * @param {object} baseLayer the layer configuration with all the base features (viewerConfig.feature.layer)
 * @param {array} layers array of vector layer configurations
 * @param {array} popups array of popups configurations
 * @param {func} onChange callback listening to changes of popups list
 * @param {component} popupComponent the component that shows the popup content
 * @param {object} location the router location
 * @param {array} categories list of available categories
 */
function OLFeaturesPopup({
    map,
    baseLayer,
    layers,
    popups,
    onChange,
    popupComponent,
    location,
    categories
}, { messages }) {

    function handleClosePopup(id) {
        onChange(popups.filter(popup => popup.id !== id));
    }

    function getFeatureProps(featureProperties) {
        const viewerConfig = getConfigProp('viewerConfig');
        const featureId = featureProperties[viewerConfig?.feature?.layer?.key] + '';
        const query = getHashQueryParameters(location);
        const featureQuery = castArray(query.feature || []);
        const isFeatureSelected = featureQuery.includes(featureId);
        const featureHref = hashLocationToHref({
            location,
            query: {
                feature: featureId
            }
        });
        return {
            featureHref,
            isFeatureSelected
        };
    }

    function getPrecinctTotalCount(currentPopupData) {
        let totalCount = 0;
        let popupData = [...currentPopupData];
        for (let popup of popupData) {
            if (popup?.props?.fields) {
                for (let field of popup.props.fields) {
                    if (field.id && Number.isInteger(field.value)) {
                        totalCount = totalCount + field.value;

                    }
                }
                const totalCountIndex = popup.props.fields.findIndex(item => !item?.id && item.labelId);
                popup.props.fields[totalCountIndex].value = totalCount;
            }
        }
        return popupData;
    }

    function getPopupProps({
        layer,
        featureProperties,
        properties
    }) {
        const { popup = {} } = layer || {};
        const viewerConfig = getConfigProp('viewerConfig');
        const title = popup?.title ? (featureProperties[viewerConfig?.feature?.layer?.key] + ' ' + getMessageById(messages, 'msEventsTracker.feature')) : false;
        const fields = (popup?.fields || [])
            .map((field) => {
                const _properties = field.target === 'feature' ? featureProperties : properties;
                const labelId = field?.labelId;
                const value = _properties[field?.key];
                return {
                    labelId,
                    value
                };
            });
        const isCategoryKeyAvailable = !!properties?.[viewerConfig?.category?.key];
        const isCategorySelected = !!categories.find(({ selected }) => selected);
        const categoriesFields = isCategoryKeyAvailable && categories
            .filter((category) => isCategorySelected && category.selected || !isCategorySelected)
            .map((category) => {
                const value = properties?.[viewerConfig?.category?.key]?.[category.value] ?? 'n/a';
                return {
                    ...category,
                    value
                };
            });
        return {
            title,
            fields: [
                ...categoriesFields,
                ...(categoriesFields?.length > 0 ? [{ divider: true }] : []),
                ...fields
            ],
            ...getFeatureProps(featureProperties)
        };
    }

    // update the feature information of popup on each location search update
    // href and selection to correctly display the checkbox
    const popupOptions = useRef();
    popupOptions.current = popups[0];
    useEffect(() => {
        const options = popupOptions.current;
        if (options) {
            const { featureProperties = {} } = options;
            onChange([
                {
                    ...options,
                    props: {
                        ...options.props,
                        ...getFeatureProps(featureProperties)
                    }
                }
            ]);
        }
    }, [location?.search]);

    // update the fields values when the layer changes based on new filters
    const layersIds = layers.map((layer) => layer.uuid).join();
    useEffect(() => {
        if (layers.length > 0) {
            const options = popupOptions.current;
            const layer = options && layers.find((l) => l.id === options.layerId);
            const selectedFeature = layer?.features?.find(feature => feature.id === options.id);
            if (selectedFeature) {
                const { properties = {} } = selectedFeature;
                const { featureProperties = {} } = options;
                onChange([
                    {
                        ...options,
                        props: getPopupProps({
                            layer,
                            featureProperties,
                            properties
                        })
                    }
                ]);
            } else {
                onChange([]);
            }
        }
    }, [layersIds]);

    // store the function in a ref to access the update of props
    const handleAddPopup = useRef();
    handleAddPopup.current = (event) => {
        onChange([]);
        let featureProperties = null;
        event.map.forEachFeatureAtPixel(event.pixel, (olFeature, olLayer) => {
            if (baseLayer?.id === olLayer.get('msId')) {
                featureProperties = olFeature.getProperties();
            }
        });
        event.map.forEachFeatureAtPixel(event.pixel, (olFeature, olLayer) => {
            const layer = layers.find((l) => l.id === olLayer.get('msId'));
            if (layer) {
                const properties = olFeature.getProperties();
                onChange([
                    {
                        id: olFeature.getId(),
                        layerId: layer.id,
                        featureProperties,
                        position: {
                            coordinates: event.coordinate
                        },
                        className: '',
                        maxWidth: 500,
                        maxHeight: 500,
                        autoPan: true,
                        component: popupComponent,
                        autoPanMargin: 16,
                        offset: [0, 0],
                        props: getPopupProps({
                            layer,
                            featureProperties,
                            properties
                        })
                    }
                ]);
            }
        });
    };


    useEffect(() => {
        function addPopup(event) {
            handleAddPopup.current(event);
        }
        if (map) {
            map.on('click', addPopup);
        }
        return () => {
            if (map) {
                map.un('click', addPopup);
            }
        };
    }, [map]);

    const popupsData = getPrecinctTotalCount(popups);
    return map
        ? (
            <>
                {
                    popupsData && <PopupSupport
                        map={map}
                        popups={popupsData}
                        onPopupClose={handleClosePopup}
                    />
                }

            </>
        )
        : null;
}

OLFeaturesPopup.contextTypes = {
    messages: PropTypes.object
};

OLFeaturesPopup.propTypes = {
    map: PropTypes.object,
    baseLayer: PropTypes.object,
    layers: PropTypes.array,
    popups: PropTypes.array,
    onChange: PropTypes.func,
    popupComponent: PropTypes.func,
    location: PropTypes.object,
    categories: PropTypes.array
};

OLFeaturesPopup.defaultProps = {
    layers: [],
    popups: [],
    onChange: () => {},
    popupComponent: PopupFields,
    categories: []
};

export default OLFeaturesPopup;
