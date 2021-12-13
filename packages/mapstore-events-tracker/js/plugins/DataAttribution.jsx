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
import Message from '@mapstore/framework/components/I18N/Message';

function DataAttribution({
    href,
    labelId
}) {

    return (
        <div className="ms-viewer-attribution">
            <a href={href} rel="noopener noreferrer" target="_blank" >{<Message msgId={labelId}/>}</a>
        </div>
    );
}


DataAttribution.contextTypes = {
    loadedPlugins: PropTypes.object
};

DataAttribution.defaultProps = {
    labelId: 'msEventsTracker.labels.dataAttribution'
};

export default createPlugin('DataAttribution', {
    component: DataAttribution,
    reducers: {},
    containers: {
        ViewerLayout: {
            target: 'footer',
            priority: 1
        },
        Footer: {
            priority: 2
        }
    },
    epics: {}
});
