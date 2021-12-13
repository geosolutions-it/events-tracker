/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import { Calendar, DateTimePicker } from 'react-widgets';
import { Glyphicon, Button } from 'react-bootstrap';
import { getDateRange } from '@js/selectors/viewer';
import { push } from 'connected-react-router';
import { hashLocationToHref } from '@js/utils/LocationUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import useDetectClickOut from '@js/hooks/useDetectClickOut';
import Message from '@mapstore/framework/components/I18N/Message';
import 'react-widgets/dist/css/react-widgets.css';

momentLocalizer(moment);

function DateFilterPlugin({
    range,
    location,
    onUpdateQuery,
    containerWidth
}) {
    const [enabled, setEnabled] = useState(false);
    const node = useDetectClickOut({
        onClickOut: () => setEnabled(false)
    });
    function handleUpdateDateRange(key, value) {
        const viewerConfig = getConfigProp('viewerConfig');
        const dateFormat = viewerConfig?.date?.format || 'YYYYMM';
        onUpdateQuery(
            hashLocationToHref({
                location,
                query: {
                    [key]: moment(value).format(dateFormat)
                },
                noHash: true,
                replaceQuery: true
            })
        );
    }
    const isSmallLayout = containerWidth < 768;
    const pickerContainerClassName = isSmallLayout ? 'ms-viewer-date-filter-panel-sm' : 'ms-viewer-date-filter-panel';
    const CalendarComponent = isSmallLayout ? DateTimePicker : Calendar;
    return (
        <div
            ref={node}
            className="ms-viewer-date-filter"
        >
            <Button
                className="square-button-md"
                bsStyle="primary"
                active={enabled}
                onClick={() => setEnabled(!enabled)}
            >
                <Glyphicon glyph="calendar"/>
            </Button>
            {enabled && <div
                className={pickerContainerClassName}
            >
                <div>
                    <label><Message msgId="msEventsTracker.prompts.dateFrom"/></label>
                    <CalendarComponent
                        value={range.from.value}
                        min={range.from.min}
                        max={range.from.max}
                        time={false}
                        initialView="year"
                        finalView="year"
                        onChange={handleUpdateDateRange.bind(null, 'from')}
                    />
                </div>
                <div>
                    <label><Message msgId="msEventsTracker.prompts.dateTo"/></label>
                    <CalendarComponent
                        value={range.to.value}
                        min={range.to.min}
                        max={range.to.max}
                        time={false}
                        initialView="year"
                        finalView="year"
                        onChange={handleUpdateDateRange.bind(null, 'to')}
                    />
                </div>
            </div>}
        </div>
    );
}

DateFilterPlugin.propTypes = {

};

DateFilterPlugin.defaultProps = {

};

const ConnectedDateFilterPlugin = connect(
    createSelector([
        getDateRange,
        state => state?.router?.location
    ], (range, location) => ({
        range,
        location
    })),
    {
        onUpdateQuery: push
    }
)(DateFilterPlugin);

export default createPlugin('DateFilter', {
    component: ConnectedDateFilterPlugin,
    reducers: {},
    containers: {
        Header: {
            priority: 2,
            target: 'rightNavBar'
        }
    },
    epics: {}
});
