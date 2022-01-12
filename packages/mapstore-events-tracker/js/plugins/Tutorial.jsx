import React from 'react';
import { connect } from 'react-redux';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { toggleTutorial } from "@mapstore/framework/actions/tutorial";
import { tutorialSelector } from "@mapstore/framework/selectors/tutorial";
import * as plugin from "@mapstore/framework/plugins/Tutorial";
import { createSelector } from 'reselect';
import { Glyphicon } from 'react-bootstrap';
import Message from '@mapstore/framework/components/I18N/Message';
import * as setupDashboardTutorial from '@js/epics/tutorial';

const ConnectedTutorialPlugin = connect(
    createSelector([
        tutorialSelector
    ], (tutorial) => ({
        tutorial
    })),
    {
        onClick: toggleTutorial
    }
)(({ onClick }) => (
    <>
        <div onClick={onClick}>
            <Glyphicon glyph="book" />
            <Message msgId="msEventsTracker.prompts.viewTutorial"/>
        </div>
    </>
));

const {  ...tutorialEpic} = plugin.default.epics;

export default createPlugin('Tutorial', {
    component: plugin.default.TutorialPlugin,
    containers: {
        Menu: {
            name: 'Tutorial',
            priority: 1,
            position: 1200,
            action: toggleTutorial,
            text: <Message msgId="View tutorial"/>,
            icon: <Glyphicon glyph="book" />,
            doNotHide: true,
            defaultPresets: 'dashboard_tutorial_list',
            presetList: 'dashboard_tutorial_list',
            id: 'dashboard_tutorial_list',
            target: 'dashboard_tutorial_list',
            Component: ConnectedTutorialPlugin
        }
    },
    reducers: plugin.default.reducers,
    epics: {...tutorialEpic, ...setupDashboardTutorial }
});
