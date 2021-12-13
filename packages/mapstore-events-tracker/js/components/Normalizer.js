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
import Select from 'react-select';

/**
 * Selects a normalization denominatior
 * @name Normalizer
 * @memberof components
 * @param {object} data
 */
function Normalizer({
    value,
    options,
    style,
    onChange
}) {

    return (
        <div className="ms-viewer-normalizer" style={style}>
            <label><Message msgId="msEventsTracker.prompts.normalBy" /></label>
            <Select
                value={{
                    ...value,
                    label: <Message msgId={value.labelId} />
                }}
                options={options.map((option) => ({
                    ...option,
                    label: <Message msgId={option.labelId} />
                }))}
                clearable={false}
                onChange={onChange}
            />
        </div>
    );
}

Normalizer.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object
};

Normalizer.defaultProps = {};

export default Normalizer;
