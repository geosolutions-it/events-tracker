/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PlotlyChart from '@mapstore/framework/components/charts/PlotlyChart';
import { withResizeDetector } from 'react-resize-detector';

const ResponsiveChart = withResizeDetector(({
    width,
    height,
    ...props
}) => {
    return (
        <PlotlyChart
            {...props}
            key={width}
            layout={{
                ...props.layout,
                width: width,
                height: height
            }}
        />
    );
});

export default ResponsiveChart;
