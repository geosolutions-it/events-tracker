import ThemeVariantSwitch from '@js/components/ThemeVariantSwitch';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import {checkThemeUpdate} from "@js/actions/viewer";
import { connect } from "react-redux";
import { createSelector } from "reselect";

const ConnectedThemeVariantSwitch = connect(
    createSelector([], () => ({})),
    {
        onCheckThemeUpdate: checkThemeUpdate
    }
)(ThemeVariantSwitch);

export default createPlugin('ThemeVariantSwitch', {
    component: ConnectedThemeVariantSwitch,
    containers: {
        Menu: {
            priority: 1
        }
    }
});
