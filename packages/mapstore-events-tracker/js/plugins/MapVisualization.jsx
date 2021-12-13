/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
    getMapVisualization,
    getMapVisualizationOptions
} from '@js/selectors/viewer';
import { hashLocationToHref } from '@js/utils/LocationUtils';
import Select from 'react-select';
import { push } from 'connected-react-router';
import usePluginItems from '@js/hooks/usePluginItems';
import Message from '@mapstore/framework/components/I18N/Message';

function MapVisualizationPlugin({
    value,
    options,
    onUpdateQuery,
    location,
    items
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });
    function handleUpdateViz(selected) {
        onUpdateQuery(
            hashLocationToHref({
                location,
                query: {
                    'map-viz': selected
                },
                noHash: true,
                replaceQuery: true
            })
        );
    }
    return (
        <div
            className="ms-map-visualization"
        >
            <div>
                <Select
                    value={{
                        ...value,
                        label: <Message msgId={value.labelId} />
                    }}
                    options={options.map((option) => ({
                        value: option.value,
                        label: <Message msgId={option.labelId} />
                    }))}
                    onChange={(event) => handleUpdateViz(event?.value)}
                    clearable={false}
                />
            </div>
            <div>
                {configuredItems
                    .map(({ Component, name }) => <Component key={name} />)}
            </div>
        </div>
    );
}

MapVisualizationPlugin.propTypes = {
    value: PropTypes.object,
    options: PropTypes.array,
    onUpdateQuery: PropTypes.func
};

MapVisualizationPlugin.defaultProps = {
    value: '',
    options: [],
    onUpdateQuery: () => {}
};

const ConnectedMapVisualizationPlugin = connect(
    createSelector([
        getMapVisualization,
        getMapVisualizationOptions,
        state => state?.router?.location
    ], (value, options, location) => ({
        value,
        options,
        location
    })),
    {
        onUpdateQuery: push
    }
)(MapVisualizationPlugin);

export default createPlugin('MapVisualization', {
    component: ConnectedMapVisualizationPlugin,
    reducers: {},
    containers: {
        ViewerLayout: {
            target: 'center',
            priority: 1
        },
        OverlayPanel: {
            priority: 2,
            titleId: 'msEventsTracker.labels.mapVisualizationTitle'
        }
    },
    epics: {}
});
