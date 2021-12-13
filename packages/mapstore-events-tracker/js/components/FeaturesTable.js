/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import max from 'lodash/max';
import isNumber from 'lodash/isNumber';
import Message from '@mapstore/framework/components/I18N/Message';
import Number from '@mapstore/framework/components/I18N/Number';

/**
 * Shows a table with checkbox to select the row and an inline bar chart
 * @name FeaturesTable
 * @memberof components
 * @param {object} data represent the structure of the table and contains the definition of rows, cols and bar chart ranges
 */
function FeaturesTable({
    data,
    numberParams
}) {
    const {
        rows = [],
        cols = [],
        ranges = {}
    } = data;

    const rangesKeys = Object.keys(ranges);
    const barsWidth = 150;
    const barHeight = 4;
    const barsHeight = (barHeight + barHeight / 2) * rangesKeys.length;

    const maxValue = max(rangesKeys.map(key => ranges[key].max));
    return (
        <table className="ms-viewer-features-table table">
            <thead >
                <tr >
                    <th></th>
                    {cols.map(({ value, color, labelId }) => {
                        return (
                            <th
                                key={value}
                            >
                                <div
                                    style={{
                                        ...(color && {
                                            borderBottom: `2px solid ${color}`
                                        })
                                    }}
                                >
                                    {labelId && <Message msgId={labelId} /> || value}
                                </div>
                            </th>
                        );
                    })}
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => {
                    const rowProps = row['@props'] || {};
                    return (
                        <tr key={idx} className={rowProps.selected ? 'info' : ''}>
                            <td>
                                <a href={rowProps.selectedHref}><Glyphicon glyph={rowProps.selected ? 'check' : 'unchecked'}/></a>
                            </td>
                            {cols.map(({ value }) => {
                                const label = row[value]?.label || row[value]?.value || row[value] || 0;
                                return (
                                    <td key={value}>
                                        {isNumber(label) ? <Number value={label} numberParams={numberParams}/> : label}
                                    </td>
                                );
                            })}
                            <td>
                                <svg
                                    viewBox={`0 0 ${barsWidth} ${barsHeight}`}
                                    style={{ width: barsWidth, height: barsHeight }}
                                >
                                    {rangesKeys.map((rangesKey, jdx) => {
                                        const value = row[rangesKey] || 0;
                                        const size = value / maxValue * barsWidth;
                                        return !isNaN(size) && size !== Infinity && size !== -Infinity
                                            ? <rect key={jdx} x={0} y={jdx * (barHeight + barHeight / 2)} width={size} height={barHeight} fill={ranges?.[rangesKey]?.color}/>
                                            : null;
                                    })}
                                </svg>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

FeaturesTable.propTypes = {
    data: PropTypes.object
};

FeaturesTable.defaultProps = {
    data: {
        rows: [],
        cols: [],
        ranges: {}
    }
};

export default FeaturesTable;
