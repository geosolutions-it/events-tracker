/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Message from '@mapstore/framework/components/I18N/Message';
import { Glyphicon } from 'react-bootstrap';

/**
 * A component used to display the popup fields
 * @name PopupFields
 * @memberof components
 * @param {string} title
 * @param {string} featureHref
 * @param {boolean} isFeatureSelected
 * @param {array} fields
 */
function PopupFields({
    title,
    featureHref,
    isFeatureSelected,
    fields
}) {
    return (
        <div className="ms-feature-popup">
            {title &&
                <a href={featureHref}>
                    <h4>
                        <Glyphicon glyph={isFeatureSelected ? 'check' : 'unchecked'}/>
                        {' '}
                        {title}
                    </h4>
                </a>}
            <p>
                <ul>
                    {fields.map((field, idx) => {
                        if (field.divider) {
                            return <div key={idx} className="ms-feature-popup-divider" />;
                        }
                        return (
                            <li
                                key={idx}
                                className="ms-feature-popup-field"
                                style={field.color ? { borderColor: field.color, borderWidth: 2 } : {}}>
                                {field.labelId && <div className="ms-feature-popup-label"><Message msgId={field.labelId} />:</div>}
                                <div className="ms-feature-popup-value">{field.value}</div>
                            </li>
                        );
                    })}
                </ul>
            </p>
        </div>
    );
}

PopupFields.propTypes = {
    title: PropTypes.string,
    featureHref: PropTypes.string,
    isFeatureSelected: PropTypes.bool,
    fields: PropTypes.array
};

PopupFields.defaultProps = {
    fields: []
};

export default PopupFields;
