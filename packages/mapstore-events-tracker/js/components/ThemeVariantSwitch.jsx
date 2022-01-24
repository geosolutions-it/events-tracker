/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import Message from '@mapstore/framework/components/I18N/HTML';

function isThemeVariantEnabled() {
    try {
        const value = localStorage.getItem('ms.themeVariantEnabled');
        return !!value;
    } catch (e) {
        return false;
    }
}

function setThemeVariantEnabled(enabled) {
    try {
        localStorage.setItem('ms.themeVariantEnabled', enabled ? 'true' : '');
    } catch (e) {
        /* */
    }
}

function ThemeVariantSwitch({ theme, onCheckThemeUpdate }) {
    const [enabled, setEnabled] = useState(isThemeVariantEnabled());
    function handleThemeSwitch() {
        setEnabled(!enabled);
        setThemeVariantEnabled(!enabled);
        onCheckThemeUpdate();
    }
    return (
        <>
            <div onClick={handleThemeSwitch}>
                <Glyphicon glyph={enabled ? 'bulb-on' : 'bulb-off'}/>
                {enabled ? <Message msgId="msEventsTracker.prompts.switchToLight" /> : <Message msgId="msEventsTracker.prompts.switchToDark" />}
            </div>
            {enabled && createPortal(
                <link
                    rel="stylesheet"
                    href={`${theme?.href}?v=${__MAPSTORE_PROJECT_CONFIG__.version || 'dev'}`}
                    type="text/css"
                />,
                document.head)}
        </>
    );
}

ThemeVariantSwitch.propTypes = {
    theme: PropTypes.bool
};

ThemeVariantSwitch.defaultProps = {
    theme: { type: 'link', href: 'themes/dark.css' }
};

export default ThemeVariantSwitch;
