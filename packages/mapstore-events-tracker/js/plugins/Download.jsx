import Download from '@js/components/Download';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import { getConfigProp } from '@mapstore/framework/utils/ConfigUtils';
import { getMapVisualizationLayers } from '@js/selectors/viewer';
import { getNormalizationValue } from '@js/selectors/normalizer';


const ConnectedDownloadPlugin = connect(
    createSelector([
        getMapVisualizationLayers,
        (state) => {
            return state?.viewer;
        },
        () => {
            return getConfigProp("viewerConfig");
        },
        getNormalizationValue
    ], (layers, viewer, viewerConfig, normalizer) => ({
        layers,
        viewer,
        viewerConfig,
        normalizer
    })),
    {}
)(Download);

export default createPlugin('Download', {
    component: ConnectedDownloadPlugin,
    containers: {
        Menu: {
            priority: 1
        }
    }
});
