/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Message from '@mapstore/framework/components/I18N/Message';
import Number from '@mapstore/framework/components/I18N/Number';

function Counter({
    style,
    option,
    numberParams,
    className
}) {
    return (
        <li
            className={`ms-viewer-counter${option.selected ? ' selected' : ''}${option.href ? ' has-link' : ''}${className ? ` ${className}` : ''}`}
            style={{
                ...style,
                borderBottom: '4px solid ' + option.color
            }}
        >
            {option.href
                ? <a href={option.href}>
                    <div className="ms-viewer-counter-title"><Message msgId={option.labelId} /></div>
                    <div className="ms-viewer-counter-count">
                        <Number value={option.count} numberParams={numberParams} />
                    </div>
                </a>
                : <div>
                    <div className="ms-viewer-counter-title"><Message msgId={option.labelId} /></div>
                    <div className="ms-viewer-counter-count">
                        <Number value={option.count} numberParams={numberParams} />
                    </div>
                </div>}
        </li>
    );
}

/**
 * Shows a list of crimes with counts
 * @name Counters
 * @memberof components
 * @param {object} data counts by crime type
 */
function Counters({
    numberParams,
    options,
    style,
    counterStyle,
    minHeight,
    counterClassName
}) {
    return (
        <ul className="ms-viewer-counters" id="tutorial-counters" style={style}>
            {options?.map((option, key) => {
                return (
                    <Counter
                        key={option.id || key}
                        style={counterStyle}
                        option={option}
                        numberParams={numberParams}
                        minHeight={minHeight}
                        className={counterClassName}
                    />
                );
            })}
        </ul>
    );
}

Counters.propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    counterStyle: PropTypes.object,
    minHeight: PropTypes.number
};

Counters.defaultProps = {
    minHeight: 70
};

export default Counters;
