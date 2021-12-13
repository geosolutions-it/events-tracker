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
import { getMapVisualizationLayers } from '@js/selectors/viewer';
import { withResizeDetector } from 'react-resize-detector';
import Message from '@mapstore/framework/components/I18N/Message';
import { computeClassification } from '@js/utils/ViewerUtils';
import { getNormalizationValue } from '@js/selectors/normalizer';

function VectorLegendPlugin({
    normalizer,
    layers,
    margin,
    width
}) {
    return (
        <div className="ms-vector-legend">
            {layers.map((layer, layerIndex) => {
                const { type, value, labelId } = computeClassification({
                    ...layer,
                    normalizer
                });
                if (type === 'classes') {
                    const rectSize = 12;
                    const deltaY = rectSize + margin;
                    const height = value.length * deltaY;
                    return (
                        <div key={layerIndex}>
                            <div><Message msgId={labelId}/></div>
                            <svg
                                viewBox={`0 0 ${width} ${height}`}
                                style={{
                                    width: width,
                                    height: height
                                }}>
                                {value.map(([color, range], idx) => {
                                    return (
                                        <g key={idx}>
                                            <rect
                                                key={idx + '-legend-color'}
                                                fill={color}
                                                x={0}
                                                y={margin + deltaY * idx}
                                                width={rectSize}
                                                height={rectSize}
                                            />
                                            <text
                                                key={idx + '-legend-color-text'}
                                                x={rectSize + margin}
                                                y={margin + deltaY * idx}
                                                alignmentBaseline="hanging"
                                            >
                                                {'>= ' + range[0].toFixed(2)}{' < ' + range[1].toFixed(2)}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    );
                }
                if (type === 'continuous') {
                    const rectSize = 12;
                    const height = 100;
                    const [minValue, maxValue, stops] = value;
                    return (
                        <div key={layerIndex}>
                            <div><Message msgId={labelId}/></div>
                            <svg
                                viewBox={`0 0 ${width} ${height}`}
                                style={{
                                    width: width,
                                    height: height
                                }}>
                                <defs>
                                    <linearGradient id="continuous-legend-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        {stops.map((color, idx) => {
                                            return (
                                                <stop
                                                    key={color}
                                                    offset={`${idx / stops.length * 100}%`}
                                                    style={{
                                                        stopColor: color,
                                                        stopOpacity: 1
                                                    }}
                                                />
                                            );
                                        })}
                                    </linearGradient>
                                </defs>
                                <rect
                                    key={'continuous-legend'}
                                    fill="url(#continuous-legend-grad)"
                                    x={0}
                                    y={margin}
                                    width={rectSize}
                                    height={height - margin}
                                />
                                <text
                                    x={rectSize + margin}
                                    y={margin}
                                    alignmentBaseline="hanging"
                                >
                                    {minValue}
                                </text>
                                <text
                                    x={rectSize + margin}
                                    y={height - margin}
                                    alignmentBaseline="baseline"
                                >
                                    {maxValue}
                                </text>
                            </svg>
                        </div>
                    );
                }
                if (type === 'circles') {
                    const [minValue, maxValue, stops] = value;
                    const strokeWidth = 0.5;
                    const cx = strokeWidth + stops[0];
                    const height = stops.reduce((sum, val) => sum + (val * 2) + margin, margin);
                    const texts = [maxValue, minValue];
                    return (
                        <div key={layerIndex}>
                            <div><Message msgId={labelId}/></div>
                            <svg
                                viewBox={`0 0 ${width} ${height}`}
                                style={{
                                    width: width,
                                    height: height
                                }}>
                                {stops.map((entry, idx) => {
                                    const prev = (stops[idx - 1] || 0) * 2;
                                    const cy = margin + margin * idx + prev + entry;
                                    return (
                                        <g key={idx}>
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={entry}
                                                stroke="black"
                                                stroke-width={strokeWidth}
                                                fill={'transparent'}
                                            />
                                            <text
                                                x={cx * 2 + margin}
                                                y={cy}
                                                alignmentBaseline="middle"
                                            >
                                                {texts[idx]}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
}

VectorLegendPlugin.propTypes = {
    layers: PropTypes.array,
    margin: PropTypes.number
};

VectorLegendPlugin.defaultProps = {
    layers: [],
    margin: 8
};

const ConnectedVectorLegendPlugin = connect(
    createSelector([
        getNormalizationValue,
        getMapVisualizationLayers
    ], (normalizer, layers) => ({
        normalizer,
        layers
    })),
    {}
)(withResizeDetector(VectorLegendPlugin));

export default createPlugin('VectorLegend', {
    component: ConnectedVectorLegendPlugin,
    reducers: {},
    containers: {
        MapVisualization: {
            priority: 1
        }
    },
    epics: {}
});
