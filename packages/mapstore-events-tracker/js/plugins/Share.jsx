import Share from '@js/components/Share';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';


export default createPlugin('Share', {
    component: Share,
    containers: {
        Menu: {
            priority: 1
        }
    }
});
