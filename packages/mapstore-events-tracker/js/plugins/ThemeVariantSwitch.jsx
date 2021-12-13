import ThemeVariantSwitch from '@js/components/ThemeVariantSwitch';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';


export default createPlugin('ThemeVariantSwitch', {
    component: ThemeVariantSwitch,
    containers: {
        Menu: {
            priority: 1
        }
    }
});
