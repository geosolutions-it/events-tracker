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
import usePluginItems from '@js/hooks/usePluginItems';
function Footer({
    msLogo,
    items,
    order
}, { loadedPlugins }) {
    const configuredItems = usePluginItems({ items, loadedPlugins });
    return (
        <div className="ms-viewer-footer">
            <div className="ms-viewer-footer-left">
                {configuredItems
                    .sort((a, b) => {
                        const aIndex = order?.indexOf(a?.name);
                        const bIndex = order?.indexOf(b?.name);
                        return aIndex > bIndex ? 1 : -1;
                    })
                    .map(({ Component, name }) => <Component key={name} />)}
            </div>
            <div className="ms-viewer-footer-right">
                <a href={msLogo.href}>
                    <div className="ms-logo">
                        <div><Message msgId={msLogo.msgId} /></div>
                        <div><img src={msLogo.src}/></div>
                    </div>
                </a>
            </div>
        </div>
    );
}


Footer.contextTypes = {
    loadedPlugins: PropTypes.object
};

Footer.defaultProps = {
    msLogo: {
        msgId: 'msEventsTracker.labels.builtWith',
        href: 'https://mapstore.geosolutionsgroup.com/mapstore',
        src: 'assets/img/mapstore-logo.png'
    }
};

export default createPlugin('Footer', {
    component: Footer,
    reducers: {},
    containers: {
        ViewerLayout: {
            target: 'footer',
            priority: 1
        }
    },
    epics: {}
});
