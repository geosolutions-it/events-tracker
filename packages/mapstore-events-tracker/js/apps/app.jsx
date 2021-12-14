/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import main from '@mapstore/framework/product/main';
import {
    setLocalConfigurationFile,
    setConfigProp
} from '@mapstore/framework/utils/ConfigUtils';
import axios from '@mapstore/framework/libs/ajax';
import Viewer from '@js/pages/Viewer';
import pluginsDef from '@js/plugins/def';
import { configureMap } from '@mapstore/framework/actions/config';
import viewerEpics from '@js/epics/viewer';
import viewer from '@js/reducers/viewer';

const pages = [{
    name: 'home',
    path: '/',
    component: Viewer
}];

function MainLoader() {
    return (
        <div className="ms-main-event-container">
            <div className="ms-main-event-content">
                <div className="ms-main-loader"></div>
                <div className="ms-main-event-text">Loading</div>
            </div>
        </div>
    );
}

function initMapStoreEventsTracker({
    mapConfigPath = 'configs/map.json',
    localConfigPath = 'configs/localConfig.json',
    viewerConfigPath = 'configs/viewerConfig.json',
    // list of path that need version parameter
    pathsNeedVersion = [
        'configs/',
        'assets/',
        'translations/',
        'ms-translations/',
        'print.json'
    ],
    version
} = {}) {

    const msVersion = __MAPSTORE_PROJECT_CONFIG__.version || 'dev';
    const v = version && version !== '{mapstore-events-tracker-version}'
        ? version
        : msVersion;
    axios.interceptors.request.use(
        config => {
            if (config.url && v && pathsNeedVersion.filter(url => config.url.match(url))[0]) {
                return {
                    ...config,
                    params: {
                        ...config.params,
                        v
                    }
                };
            }
            return config;
        }
    );
    setLocalConfigurationFile(localConfigPath);
    // load a base map configuration
    axios.all([
        axios.get(mapConfigPath).then(({ data }) => data),
        axios.get(viewerConfigPath).then(({ data }) => data)
    ])
        .then(([data, viewerConfig]) => {
            if (viewerConfig.title) {
                document.title = viewerConfig.title;
            }
            setConfigProp('viewerConfig', viewerConfig);
            // initialize the mapstore app
            main({
                targetId: 'container',
                pages,
                initialState: {
                    defaultState: {
                        maptype: {
                            mapType: 'openlayers'
                        }
                    }
                },
                appReducers: {
                    viewer
                },
                appEpics: {
                    ...viewerEpics
                },
                printingEnabled: false
            },
            pluginsDef,
            // TODO: use default main import to avoid override
            (cfg) => ({
                ...cfg,
                loaderComponent: MainLoader,
                initialActions: [
                    configureMap.bind(null, data, 1, true)
                ]
            }));
        });
}

window.initMapStoreEventsTracker = initMapStoreEventsTracker;
