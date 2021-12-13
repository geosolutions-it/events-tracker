/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import PopupFields from '@js/components/PopupFields';

/**
 * A Map popup that shows up on pointer move event
 * @name OLPointerMoveFeaturesPopup
 * @memberof components
 * @param {ol.Map} map a instance of OpenLayers map
 * @param {number} width container width
 * @param {array} layers array of vector layer configurations
 * @param {boolean} disabled disabled the pointer move functionalities
 * @param {component} popupComponent the component that shows the popup content
 */
function OLPointerMoveFeaturesPopup({
    map,
    width,
    layers,
    disabled,
    popupComponent
}) {

    const [pixel, setPixel] = useState([0, 0]);
    const [fields, setFields] = useState(null);

    // store the function in a ref to access the update of props
    const handlePointerMove = useRef();
    handlePointerMove.current = (event) => {
        setFields(null);
        if (!disabled) {
            event.map.forEachFeatureAtPixel(event.pixel, (olFeature, olLayer) => {
                const layer = layers.find((l) => l.id === olLayer.get('msId'));
                const configFields = layer?.pointerMovePopup?.fields;
                if (configFields) {
                    const properties = olFeature.getProperties();
                    setPixel(event.pixel);
                    setFields(
                        configFields.map((field) => ({
                            value: properties[field.key],
                            labelId: field.labelId
                        }))
                    );
                }
            });
        }
    };

    useEffect(() => {
        const pointerMove = (event) => {
            handlePointerMove.current(event);
        };
        function reset() {
            setFields(null);
        }
        if (map) {
            map.on('pointermove', pointerMove);
            map.getViewport().addEventListener('mouseout', reset, false);
        }
        return () => {
            if (map) {
                map.un('pointermove', pointerMove);
                map.getViewport().removeEventListener('mouseout', reset, false);
            }
        };
    }, [map]);

    const Popup = popupComponent;

    return !disabled && fields
        ? (
            <div
                className="shadow-far ms-popup-mouse-over"
                style={{
                    position: 'absolute',
                    left: pixel[0],
                    top: pixel[1],
                    maxWidth: 256,
                    minWidth: 200,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    pointerEvents: 'none',
                    transform: `translateY(-50%) translateX(${ pixel[0] > width / 2 ? 'calc(-100% - 20px)' : '20px'})`
                }}>
                <div
                    style={{
                        flex: 1,
                        position: 'relative',
                        overflow: 'auto'
                    }}>
                    <Popup fields={fields}/>
                </div>
            </div>
        )
        : null;
}

OLPointerMoveFeaturesPopup.propTypes = {
    map: PropTypes.object,
    width: PropTypes.number,
    layers: PropTypes.array,
    disabled: PropTypes.bool,
    popupComponent: PropTypes.func
};

OLPointerMoveFeaturesPopup.defaultProps = {
    layers: [],
    popupComponent: PopupFields
};

export default OLPointerMoveFeaturesPopup;
