/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import Normalizer from '@js/components/Normalizer';
import { push } from 'connected-react-router';
import {
    getNormalizationDenominators,
    getNormalizationValue
} from '@js/selectors/normalizer';
import { hashLocationToHref } from '@js/utils/LocationUtils';
function NormalizerPlugin({
    value,
    options,
    onUpdateQuery,
    location
}) {
    function handleUpdateNormalizer(event) {
        onUpdateQuery(
            hashLocationToHref({
                location,
                query: {
                    normalizer: event.value
                },
                noHash: true,
                replaceQuery: true
            })
        );
    }
    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <Normalizer
                value={value}
                options={options}
                onChange={handleUpdateNormalizer}
                style={{
                    margin: 8
                }}
            />
        </div>
    );
}

NormalizerPlugin.propTypes = {
    options: PropTypes.array
};

NormalizerPlugin.defaultProps = {
    options: []
};

const ConnectedNormalizerPlugin = connect(
    createSelector([
        getNormalizationDenominators,
        getNormalizationValue,
        state => state?.router?.location
    ], (options, value, location) => ({
        options,
        value,
        location
    })),
    {
        onUpdateQuery: push
    }
)(NormalizerPlugin);

export default createPlugin('Normalizer', {
    component: ConnectedNormalizerPlugin,
    reducers: {},
    containers: {
        ViewerLayout: {
            priority: 1,
            target: 'rightColumnTop'
        },
        OverlayPanel: {
            priority: 2
        }
    },
    epics: {}
});
