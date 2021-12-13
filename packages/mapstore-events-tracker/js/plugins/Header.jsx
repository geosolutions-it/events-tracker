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
import { getDateRange } from '@js/selectors/viewer';
import usePluginItems from '@js/hooks/usePluginItems';
import moment from 'moment';
import { withResizeDetector } from 'react-resize-detector';
import Message from '@mapstore/framework/components/I18N/Message';

/**
 * header of the viewer
 * @prop {object} cfg.logo
 * @prop {string} cfg.logo.src image path of the logo
 * @prop {string} cfg.logo.href link for the logo
 * @prop {string} cfg.dateFormat format of the dates, default MMM YYYY
 * @prop {boolean} cfg.hideDate hide date displayed in the header
 * @memberof plugins
 */
function Header({
    items,
    logo,
    dateRange,
    dateFormat,
    hideDate,
    width,
    order,
    titleId
}, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const dateFrom = dateRange?.from?.value && moment(dateRange.from.value).format(dateFormat);
    const dateTo = dateRange?.to?.value && moment(dateRange.to.value).format(dateFormat);
    return (
        <div
            className="ms-viewer-header"
        >
            <div className="ms-viewer-header-left">
                {logo.map((entry) => {
                    return (
                        <a href={entry.href}>
                            <img src={entry.src}/>
                        </a>
                    );
                })}
                {titleId && <h1>
                    <Message msgId={titleId} />
                </h1>}
            </div>
            <div className="ms-viewer-header-right">
                {!hideDate && <div className="ms-viewer-header-date">
                    {dateFrom === dateTo ? dateFrom : `${dateFrom} - ${dateTo}`}
                </div>}
                {configuredItems
                    .filter(({ target }) => target === 'rightNavBar')
                    .sort((a, b) => {
                        const aIndex = order.indexOf(a?.name);
                        const bIndex = order.indexOf(b?.name);
                        return aIndex > bIndex ? 1 : -1;
                    })
                    .map(({ Component, name }) => <Component key={name} bsStyle="primary" containerWidth={width}/>)}
            </div>
        </div>
    );
}

Header.contextTypes = {
    loadedPlugins: PropTypes.object
};

Header.propTypes = {
    dateFormat: PropTypes.string,
    hideDate: PropTypes.bool,
    order: PropTypes.array,
    titleId: PropTypes.string
};

Header.defaultProps = {
    dateFormat: 'MMM YYYY',
    order: ['DateFilter', 'OverlayPanel', 'Menu']
};

const ConnectedHeader = connect(
    createSelector([
        getDateRange,
        state => state?.router?.location
    ], (dateRange) => ({
        dateRange
    })),
    {}
)(withResizeDetector(Header));

export default createPlugin('Header', {
    component: ConnectedHeader,
    reducers: {},
    containers: {
        ViewerLayout: {
            target: 'header',
            priority: 1
        }
    },
    epics: {}
});
