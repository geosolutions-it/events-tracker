import React from 'react';
import { createPlugin } from '@mapstore/framework/utils/PluginsUtils';
import Menu from '@js/components/Menu';
import PropTypes from 'prop-types';
import usePluginItems from '@js/hooks/usePluginItems';

function MenuPlugin({ items, order}, context) {
    const { loadedPlugins } = context;
    const menuItems = usePluginItems({ items, loadedPlugins });
    const sortedItems = [...menuItems].sort((a, b) => {
        const aIndex = order?.indexOf(a?.name);
        const bIndex = order?.indexOf(b?.name);
        return aIndex > bIndex ? 1 : -1;
    });
    if (sortedItems.length) {
        return (
            <Menu
                menuItems={sortedItems}
            />
        );
    }
    return null;
}

Menu.contextTypes = {
    loadedPlugins: PropTypes.object
};


Menu.defaultProps = {
    order: ['Share', 'ThemeVariantSwitch', 'Download']
};

export default createPlugin('Menu', {
    component: MenuPlugin,
    containers: {
        Header: {
            priority: 1,
            target: 'rightNavBar'
        }
    }
});
