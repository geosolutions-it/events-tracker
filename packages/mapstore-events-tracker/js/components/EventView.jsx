/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

function EventView({ children, style }) {
    return (
        <div className="ms-event-view" style={style}>
            <div>{children}</div>
        </div>
    );
}

export default EventView;
