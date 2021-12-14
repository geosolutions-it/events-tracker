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
import { Glyphicon, Button } from 'react-bootstrap';
import usePluginItems from '@js/hooks/usePluginItems';
import { setControlProperty } from '@mapstore/framework/actions/controls';
import Message from '@mapstore/framework/components/I18N/Message';

function OverlayPanelPlugin({
    items,
    enabled,
    order
}, context) {

    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });

    return (
        <div
            className="ms-overlay-panel"
            style={{ display: enabled ? 'block' : 'none' }}
        >
            {configuredItems
                .sort((a, b) => {
                    const aIndex = order.indexOf(a?.name);
                    const bIndex = order.indexOf(b?.name);
                    return aIndex > bIndex ? 1 : -1;
                })
                .map(({ Component, name, titleId }) => <>
                    {titleId && <h2><Message msgId={titleId} /></h2>}
                    <Component key={name} />
                </>)}
        </div>
    );
}

OverlayPanelPlugin.contextTypes = {
    loadedPlugins: PropTypes.object
};

OverlayPanelPlugin.propTypes = {
    enabled: PropTypes.bool,
    order: PropTypes.array
};

OverlayPanelPlugin.defaultProps = {
    enabled: false,
    order: ['MapVisualization', 'Normalizer', 'Counters', 'Chart', 'FeaturesPanel']
};

const ConnectedOverlayPanelPlugin = connect(
    createSelector([
        state => state?.controls?.overlayPanel?.enabled || false
    ], (enabled) => ({
        enabled
    }))
)(OverlayPanelPlugin);

function OverlayPanelToggleButton({
    enabled,
    onClick
}) {
    return (
        <Button
            className="square-button-md"
            bsStyle="primary"
            active={enabled}
            onClick={() => onClick(!enabled)}
        >
            <Glyphicon glyph={enabled ? '1-close' : 'list-alt'}/>
        </Button>
    );
}

const ConnectedOverlayPanelToggleButton = connect(
    createSelector([
        state => state?.controls?.overlayPanel?.enabled || false
    ], (enabled) => ({
        enabled
    })),
    {
        onClick: setControlProperty.bind(null, 'overlayPanel', 'enabled')
    }
)(OverlayPanelToggleButton);

export default createPlugin('OverlayPanel', {
    component: ConnectedOverlayPanelPlugin,
    reducers: {},
    containers: {
        Header: {
            target: 'rightNavBar',
            Component: ConnectedOverlayPanelToggleButton,
            priority: 1
        },
        ViewerLayout: {
            priority: 1
        }
    },
    epics: {}
});
