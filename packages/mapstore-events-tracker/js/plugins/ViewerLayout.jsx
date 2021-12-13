/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createSelector } from "reselect";
import isEqual from "lodash/isEqual";
import { createPlugin } from "@mapstore/framework/utils/PluginsUtils";
import usePluginItems from "@js/hooks/usePluginItems";
import { withResizeDetector } from "react-resize-detector";
import { resizeMap } from "@mapstore/framework/actions/map";
import FullScreen from "@js/components/FullScreen";
import EventView from "@js/components/EventView";
import Loader from "@mapstore/framework/components/misc/Loader";
import Message from "@mapstore/framework/components/I18N/Message";

function Center({
    centerItems,
    width,
    height,
    onResize
}) {
    useEffect(() => {
        onResize();
    }, [width]);
    const size = width < 840 ? "sm" : "lg";
    return (
        <div className={`ms-viewer-center ms-viewer-center-${size}`} key={`${width}x${height}`}>
            {centerItems}
        </div>
    );
}

const ConnectedCenter = connect(
    createSelector([], () => ({})),
    {
        onResize: resizeMap
    }
)(withResizeDetector(Center));

function filterItems(configuredItems, targetName) {
    return configuredItems
        .filter(({ target }) => target === targetName)
        .map(({ Component, name }) => <Component key={name} />);
}

function getSize(width) {
    if (width === undefined) {
        return "";
    }
    return width < 1300 ? "sm" : "lg";
}

function ViewerLayout({
    items,
    width,
    loading,
    error,
    disableFullscreen
}, context) {
    const { loadedPlugins } = context;
    const size = getSize(width);
    const configuredItems = usePluginItems({ items, loadedPlugins });
    const [fullscreen, setFullScreen] = useState("");
    const bodyItems = configuredItems
        .filter(({ target }) => !target)
        .map(({ Component, name }) => <Component key={name} />);
    const centerItems = filterItems(configuredItems, "center");
    const leftColumnItems = filterItems(configuredItems, "leftColumn");
    const rightColumnTop = filterItems(configuredItems, "rightColumnTop");
    const rightColumnItems = filterItems(configuredItems, "rightColumn");

    if (!loading && error) {
        return (
            <div className={`ms-viewer ms-viewer-${size}`}>
                <header>
                    {configuredItems
                        .filter(({ target }) => target === "header")
                        .map(({ Component, name }) => <Component key={name} />)}
                </header>
                <EventView><h1><Message msgId={error.msgId} /></h1><p>{error.message}</p></EventView>
                <footer>
                    {configuredItems
                        .filter(({ target }) => target === "footer")
                        .map(({ Component, name }) => <Component key={name} />)}
                </footer>
            </div>
        );
    }

    return (
        <div className={`ms-viewer ms-viewer-${size}${fullscreen ? " fullscreen" : ""}`}>
            <header>
                {configuredItems
                    .filter(({ target }) => target === "header")
                    .map(({ Component, name }) => <Component key={name} />)}
            </header>

            {!fullscreen && size === "lg" &&
                <div className="ms-viewer-body" style={{transform: "translate(0, 0)"}} >

                    <div style={{position: "relative"}}>
                        {leftColumnItems}
                        <FullScreen
                            show={!disableFullscreen}
                            onClick={() => setFullScreen("leftColumn")}
                            glyph="resize-full"
                        />
                    </div>

                    <div style={{display: "flex", flex: 1, position: "relative", flexDirection: "column"}}>

                        <div style={{flex: 1, position: "relative", width: "100%"}}>
                            <ConnectedCenter centerItems={centerItems} />
                            <FullScreen
                                show={!disableFullscreen}
                                onClick={() => setFullScreen("center")}
                                glyph="resize-full"
                            />
                        </div>

                        <div>
                            {bodyItems}
                            <FullScreen
                                show={!disableFullscreen}
                                onClick={() => setFullScreen("body")}
                                glyph="resize-full"
                            />
                        </div>

                    </div>

                    <div style={{display: "flex", flexDirection: "column", position: "relative"}}>
                        {rightColumnTop}
                        <div style={{flex: 1, position: "relative", width: "100%"}}>
                            {rightColumnItems}
                        </div>
                    </div>

                </div>
            }

            {!fullscreen && size === "sm" &&
                <>
                    <div className="ms-viewer-body" style={{transform: "translate(0, 0)"}} >

                        <div style={{display: "flex", flex: "1 1 0%", position: "relative", width: "100%", flexDirection: "column"}}>

                            <div style={{flex: "1 1 0%", position: "relative", width: "100%"}}>
                                <ConnectedCenter centerItems={centerItems} />
                                <FullScreen
                                    show={!disableFullscreen}
                                    onClick={() => setFullScreen("center")}
                                    glyph="resize-full"
                                />
                            </div>

                            <div>
                                {bodyItems}
                                <FullScreen
                                    show={!disableFullscreen}
                                    onClick={() => setFullScreen("body")}
                                    glyph="resize-full"
                                />
                            </div>

                        </div>

                        <div style={{display: "flex", flexDirection: "column", position: "relative"}}>
                            {rightColumnTop}
                            <div style={{flex: "1 1 0%", position: "relative", width: "100%"}}>
                                {rightColumnItems}
                            </div>
                        </div>

                    </div>

                    <div style={{position: "relative"}}>
                        {leftColumnItems}
                        <FullScreen
                            show={!disableFullscreen}
                            onClick={() => setFullScreen("leftColumn")}
                            glyph="resize-full"
                        />
                    </div>

                </>
            }

            {fullscreen === "center" &&
            <>
                <div className="ms-viewer-body">
                    {centerItems}
                    <FullScreen
                        show
                        onClick={() => setFullScreen("")}
                        glyph="resize-small"
                    />
                </div>
            </>}

            {fullscreen === "body" &&
            <>
                <div className="ms-viewer-body">
                    {bodyItems}
                    <FullScreen
                        show
                        onClick={() => setFullScreen("")}
                        glyph="resize-small"
                    />
                </div>
            </>}

            {fullscreen === "leftColumn" &&
            <>
                <div className="ms-viewer-body">
                    {leftColumnItems}
                    <FullScreen
                        show
                        onClick={() => setFullScreen("")}
                        glyph="resize-small"
                    />
                </div>
            </>}

            <footer>
                {configuredItems
                    .filter(({ target }) => target === "footer")
                    .map(({ Component, name }) => <Component key={name} />)}
            </footer>
            {loading && <EventView style= {{ opacity: 0.5 }}><Loader size={70} /></EventView>}
        </div>
    );
}

ViewerLayout.contextTypes = {
    loadedPlugins: PropTypes.object
};

function arePropsEqual(prevProps, nextProps) {
    return isEqual(prevProps, nextProps);
}

const MemoizeDashboardLayout = memo(withResizeDetector(ViewerLayout), arePropsEqual);

const DashboardLayoutPlugin = connect(
    createSelector([
        state => state?.viewer?.loading,
        state => state?.viewer?.error
    ], (loading, error) => ({
        loading,
        error
    })),
    {}
)(MemoizeDashboardLayout);

export default createPlugin("ViewerLayout", {
    component: DashboardLayoutPlugin,
    containers: {},
    epics: {},
    reducers: {}
});
