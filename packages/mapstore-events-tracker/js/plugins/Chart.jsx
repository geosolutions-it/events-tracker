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
import {
    getMainChartData,
    getMainChartShapes
} from '@js/selectors/viewer';
import { getMessageById } from '@mapstore/framework/utils/LocaleUtils';
import ResponsiveChart from '@js/components/ResponsiveChart';
import EventView from '@js/components/EventView';
import Message from '@mapstore/framework/components/I18N/Message';
import Loader from '@mapstore/framework/components/misc/Loader';
import { RequestId } from '@js/utils/ApiUtils';

/**
 * main line chart showing the date/count sequence
 * @memberof plugins
 */
function ChartPlugin({
    data,
    shapes,
    xLabelId,
    yLabelId,
    loading,
    error
}, { messages }) {
    const isEmpty = data.length === 0;
    return (
        <div className="ms-chart-container">
            <div className="ms-box">
                {!isEmpty && <ResponsiveChart
                    layout={{
                        margin: {
                            l: 60,
                            r: 8,
                            b: 60,
                            t: 8,
                            pad: 4
                        },
                        xaxis: {
                            title: {
                                text: getMessageById(messages, xLabelId)
                            }
                        },
                        yaxis: {
                            title: {
                                text: getMessageById(messages, yLabelId)
                            }
                        },
                        showlegend: true,
                        font: {
                            size: 10
                        },
                        legend: {
                            x: 0.5,
                            yanchor: 'bottom',
                            xanchor: 'center',
                            y: 1,
                            orientation: 'h'
                        },
                        shapes
                    }}
                    data={data.map((entry) => ({
                        ...entry,
                        name: getMessageById(messages, entry.name || entry.id)
                    }))}
                    config={{
                        displayModeBar: false,
                        displaylogo: false
                    }}
                />}
                {isEmpty && <EventView>
                    <Message msgId="msEventsTracker.labels.emptyChart" />
                </EventView>}
                {loading && <EventView style= {{ opacity: 0.5 }}><Loader size={70} /></EventView>}
                {(!loading && error) && <EventView><h1><Message msgId={error.msgId} /></h1><p>{error.message}</p></EventView>}
            </div>
        </div>
    );
}

ChartPlugin.contextTypes = {
    messages: PropTypes.object
};

ChartPlugin.propTypes = {
    data: PropTypes.array
};

ChartPlugin.defaultProps = {
    data: []
};

const ConnectedChartPlugin = connect(
    createSelector([
        getMainChartData,
        getMainChartShapes,
        state => state?.viewer?.[`${RequestId.CHART}Loading`],
        state => state?.viewer?.[`${RequestId.CHART}Error`]
    ], (chart, shapes, loading, error) => ({
        data: chart?.data,
        shapes,
        xLabelId: chart?.xLabelId || "msEventsTracker.labels.time",
        yLabelId: (chart?.yLabelId !== "msEventsTracker.prompts.normalByNone" && chart?.yLabelId) ?
            chart.yLabelId : "msEventsTracker.dataPoints",
        loading,
        error
    }))
)(ChartPlugin);

export default createPlugin('Chart', {
    component: ConnectedChartPlugin,
    reducers: {},
    containers: {
        ViewerLayout: {
            priority: 1
        },
        OverlayPanel: {
            priority: 2,
            titleId: 'msEventsTracker.labels.chartTitle'
        }
    },
    epics: {}
});
