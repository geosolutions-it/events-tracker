
import React from 'react';
import {
    DropdownButton,
    MenuItem,
    Glyphicon
} from 'react-bootstrap';
import PropTypes from 'prop-types';

function Menu({ menuItems}) {
    return (
        <DropdownButton
            id="dropdown-menu-button"
            title={<Glyphicon glyph="option-vertical" />}
            bsStyle="primary"
            className="square-button-md"
            noCaret
            pullRight
        >
            {
                menuItems.map(({Component, name}) => {
                    return (
                        <MenuItem key={name}>
                            <Component/>
                        </MenuItem>
                    );
                })
            }
        </DropdownButton>
    );
}

Menu.defaultProps = {
    menuItems: []
};

Menu.propTypes = {
    menuItems: PropTypes.array
};

export default Menu;

