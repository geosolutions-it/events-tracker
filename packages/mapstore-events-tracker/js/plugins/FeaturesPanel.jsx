/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Nav, NavItem } from 'react-bootstrap';
import {
    getTableData,
    getDetailData,
    getMainChartShapes,
    getFeatureVisualization,
    getFeatureVisualizationTabs,
    getSelectedFeatures,
    getFeatureOptions
} from '@js/selectors/viewer';
import FeaturesTable from '@js/components/FeaturesTable';
import FeaturesDetail from '@js/components/FeaturesDetail';
import Message from '@mapstore/framework/components/I18N/Message';
import { push } from 'connected-react-router';
import { getNumberParams } from '@js/selectors/normalizer';
import EventView from '@js/components/EventView';
import Loader from '@mapstore/framework/components/misc/Loader';
import { RequestId } from '@js/utils/ApiUtils';

const ConnectedFeaturesTable = connect(
    createSelector([
        getTableData,
        getNumberParams,
        state => state?.router?.location
    ], (data, numberParams, location) => ({
        data,
        numberParams,
        location
    })),
    {
        onUpdateQuery: push
    }
)(FeaturesTable);

const ConnectedFeaturesDetail = connect(
    createSelector([
        getDetailData,
        getMainChartShapes,
        getSelectedFeatures,
        getFeatureOptions,
        state => state?.router?.location
    ], (data, shapes, selected, options, location) => ({
        data,
        shapes,
        selected,
        options,
        location
    })),
    {
        onUpdateQuery: push
    }
)(FeaturesDetail);
function FeaturesPanelPlugin({
    activeTab,
    tabs,
    isEmpty,
    loading,
    error
}) {
    const Body = activeTab === 'table'
        ? ConnectedFeaturesTable
        : ConnectedFeaturesDetail;
    return (
        <div className="ms-features-panel" id="tutorial-table">
            <div className="ms-box" >
                <div className="ms-features-panel-content">
                    <Nav bsStyle="tabs" activeKey={activeTab}>
                        {tabs.map((tab) => {
                            return (
                                <NavItem
                                    key={tab.id}
                                    eventKey={tab.id}
                                    href={tab.href}
                                >
                                    <Message msgId={tab.labelId} />
                                </NavItem>
                            );
                        })}
                    </Nav>
                    <div style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
                        {!isEmpty && <Body />}
                        {isEmpty && <EventView>
                            <Message msgId="msEventsTracker.labels.emptyPanel" />
                        </EventView>}
                        {loading && <EventView style= {{ opacity: 0.5 }}><Loader size={70} /></EventView>}
                        {(!loading && error) && <EventView><h1><Message msgId={error.msgId} /></h1><p>{error.message}</p></EventView>}
                    </div>
                </div>
            </div>
        </div>
    );
}

FeaturesPanelPlugin.propTypes = {};

FeaturesPanelPlugin.defaultProps = {};

function isPanelEmpty({ tableData, detailData }) {
    return !tableData?.rows?.length && !detailData?.counters?.length && !detailData?.lineCharts?.length;
}

const ConnectedFeaturesPanelPlugin = connect(
    createSelector([
        getFeatureVisualization,
        getFeatureVisualizationTabs,
        getTableData,
        getDetailData,
        state => state?.viewer?.[`${RequestId.TABLE}Loading`],
        state => state?.viewer?.[`${RequestId.TABLE}Error`],
        state => state?.viewer?.[`${RequestId.DETAILS}Loading`],
        state => state?.viewer?.[`${RequestId.DETAILS}Error`]
    ], (activeTab, tabs, tableData, detailData, tableLoading, tableError, detailLoading, detailError) => ({
        activeTab,
        tabs,
        isEmpty: isPanelEmpty({ tableData, detailData }),
        loading: activeTab === 'table' ? tableLoading : detailLoading,
        error: activeTab === 'table' ? tableError : detailError
    }))
)(FeaturesPanelPlugin);

export default createPlugin('FeaturesPanel', {
    component: ConnectedFeaturesPanelPlugin,
    reducers: {},
    containers: {
        ViewerLayout: {
            priority: 1,
            target: 'leftColumn'
        },
        OverlayPanel: {
            priority: 2,
            titleId: 'msEventsTracker.labels.featuresPanelTitle'
        }
    },
    epics: {}
});
