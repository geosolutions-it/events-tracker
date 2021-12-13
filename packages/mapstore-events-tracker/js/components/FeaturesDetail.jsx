/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import ResponsiveChart from '@js/components/ResponsiveChart';
import Counters from '@js/components/Counters';
import { getMessageById } from '@mapstore/framework/utils/LocaleUtils';
import { hashLocationToHref } from '@js/utils/LocationUtils';
import localizedProps from '@mapstore/framework/components/misc/enhancers/localizedProps';
import Message from '@mapstore/framework/components/I18N/Message';
import EventView from '@js/components/EventView';

const LocalizedSelect = localizedProps('placeholder')(Select);

function FeaturesDetail({
    data,
    shapes,
    xLineLabelId,
    yLineLabelId,
    selected,
    options,
    onUpdateQuery,
    location
}, { messages }) {
    const {
        barChartRange,
        barCharts = [],
        lineChartRange,
        lineCharts = [],
        counters
    } = data;

    function handleUpdateFeatures(event) {
        const value = event.map((entry) => entry.value);
        onUpdateQuery(
            hashLocationToHref({
                location,
                query: {
                    feature: value
                },
                noHash: true,
                replaceQuery: true
            })
        );
    }

    let normalizerLabelId = 'msEventsTracker.dataPoints';
    const featureNames = [];
    const isEmpty = selected.length === 0;
    return (
        <div className="ms-features-detail">
            <div className="ms-features-detail-head">
                <LocalizedSelect
                    value={selected}
                    options={options}
                    placeholder="msEventsTracker.prompts.selectFeature"
                    multi
                    onChange={handleUpdateFeatures}
                />
            </div>
            <div className="ms-features-detail-body">
                {barCharts.length > 0 && <section>
                    <div className="ms-features-detail-title">{getMessageById(messages, 'msEventsTracker.labels.barChartTitle')}</div>
                    <div className="ms-features-detail-description">{getMessageById(messages, 'msEventsTracker.labels.barChartDesctiption')}</div>
                    {barCharts.map((barChart, idx) => {
                        barChart.data.x.forEach((featureName, i) => {
                            if (i < barChart.data.x.length - 1) {
                                featureNames.push(featureName);
                            }
                        });
                        normalizerLabelId = barChart.yBarLabelId === 'msEventsTracker.prompts.normalByNone' ? 'msEventsTracker.dataPoints' : barChart.yBarLabelId;
                        return (
                            <div key={barChart.data.name || idx} className="ms-features-detail-bar-chart">
                                <ResponsiveChart
                                    layout={{
                                        margin: {
                                            l: 60,
                                            r: 8,
                                            b: 60,
                                            t: 8,
                                            pad: 4
                                        },
                                        xaxis: {
                                            type: 'category',
                                            fixedrange: true,
                                            title: {
                                                text: ''
                                            }
                                        },
                                        yaxis: {
                                            range: barChartRange,
                                            fixedrange: true,
                                            title: {
                                                text: getMessageById(messages, normalizerLabelId)
                                            }
                                        },
                                        font: {
                                            size: 10
                                        },
                                        showlegend: false
                                    }}
                                    data={[{
                                        ...barChart.data,
                                        type: 'bar'
                                    }]}
                                    config={{
                                        displayModeBar: false,
                                        displaylogo: false
                                    }}
                                />
                            </div>
                        );
                    })}
                </section>}
                {counters.length > 0 && <section>
                    <div className="ms-features-detail-title">{getMessageById(messages, normalizerLabelId)}</div>
                    <div className="ms-features-detail-description">{featureNames.join(', ')}</div>
                    <Counters options={counters}/>
                </section>}
                {lineCharts.length > 0 && <section>
                    <div className="ms-features-detail-title">{getMessageById(messages, normalizerLabelId)}</div>
                    <div className="ms-features-detail-description"></div>
                    {lineCharts.map((lineChart, idx) => {
                        const yLabelId = lineChart.yLabelId === 'msEventsTracker.prompts.normalByNone' ? 'msEventsTracker.dataPoints' : lineChart.yLabelId;
                        return (
                            <div key={lineChart.feature || idx}>
                                <div className="ms-features-detail-chart-title">{lineChart.feature + ' ' + getMessageById(messages, 'msEventsTracker.feature')}</div>
                                <div className="ms-features-detail-line-chart">
                                    <ResponsiveChart
                                        layout={{
                                            margin: {
                                                l: 50,
                                                r: 8,
                                                b: 60,
                                                t: 8,
                                                pad: 4
                                            },
                                            xaxis: {
                                                fixedrange: true,
                                                title: {
                                                    text: getMessageById(messages, lineChart.xLabelId || xLineLabelId)
                                                }
                                            },
                                            yaxis: {
                                                range: lineChartRange,
                                                fixedrange: true,
                                                title: {
                                                    text: getMessageById(messages, yLabelId || yLineLabelId)
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
                                        data={lineChart.data.map((entry) => ({
                                            ...entry,
                                            mode: 'lines',
                                            name: (entry.name || entry.id) ? getMessageById(messages, entry.name || entry.id) : undefined
                                        }))}
                                        config={{
                                            displayModeBar: false,
                                            displaylogo: false
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </section>}
                {isEmpty && <EventView style={{ position: 'relative', zIndex: 0 }}>
                    <Message msgId="msEventsTracker.labels.selectFeatures" />
                </EventView>}
            </div>
        </div>
    );
}

FeaturesDetail.contextTypes = {
    messages: PropTypes.object
};

FeaturesDetail.propTypes = {
    xBarLabelId: PropTypes.string,
    yBarLabelId: PropTypes.string,
    xLineLabelId: PropTypes.string,
    yLineLabelId: PropTypes.string,
    onUpdateQuery: PropTypes.func
};

FeaturesDetail.defaultProps = {
    xBarLabelId: 'msEventsTracker.feature',
    yBarLabelId: 'msEventsTracker.labels.count',
    xLineLabelId: 'msEventsTracker.labels.month',
    yLineLabelId: 'msEventsTracker.labels.count',
    onUpdateQuery: () => {}
};

export default FeaturesDetail;
