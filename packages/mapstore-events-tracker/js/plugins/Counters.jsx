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
import Counters from '@js/components/Counters';
import { getViewerCategories } from '@js/selectors/viewer';
import { getNumberParams } from '@js/selectors/normalizer';
import EventView from '@js/components/EventView';
import Message from '@mapstore/framework/components/I18N/Message';
import { RequestId } from '@js/utils/ApiUtils';
import Loader from '@mapstore/framework/components/misc/Loader';
function CountersPlugin({
    numberParams,
    options,
    loading,
    error,
    style,
    counterStyle,
    counterClassName,
    scrollBarEnabled
}) {
    const isEmpty = options.length === 0;
    const countersStyle = style
        ? style
        : scrollBarEnabled
            ? { position: 'absolute' }
            : {};
    return (
        <div className="ms-counters-container">
            <Counters
                style={countersStyle}
                numberParams={numberParams}
                options={options}
                counterStyle={counterStyle}
                counterClassName={counterClassName}
            />
            {isEmpty && <EventView>
                <Message msgId="msEventsTracker.labels.emptyCounters" />
            </EventView>}
            {loading && <EventView style= {{ opacity: 0.5 }}><Loader size={70} /></EventView>}
            {(!loading && error) && <EventView><h1><Message msgId={error.msgId} /></h1><p>{error.message}</p></EventView>}
        </div>
    );
}

Counters.propTypes = {
    options: PropTypes.array
};

CountersPlugin.defaultProps = {
    options: []
};

const ConnectedCountersPlugin = connect(
    createSelector([
        getViewerCategories,
        getNumberParams,
        state => state?.viewer?.[`${RequestId.COUNTERS}Loading`],
        state => state?.viewer?.[`${RequestId.COUNTERS}Error`]
    ], (options, numberParams, loading, error) => ({
        options,
        numberParams,
        loading,
        error
    }))
)(CountersPlugin);

export default createPlugin('Counters', {
    component: ConnectedCountersPlugin,
    reducers: {},
    containers: {
        ViewerLayout: {
            priority: 1,
            target: 'rightColumn'
        },
        OverlayPanel: {
            priority: 2,
            titleId: 'msEventsTracker.labels.countersTitle'
        }
    },
    epics: {}
});
