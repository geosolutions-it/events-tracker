import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';


function FullScreen({
    onClick,
    glyph,
    style,
    show
}) {
    if (show) {
        return (
            <Button
                className="square-button-md no-border shadow-soft fullscreen-button"
                style={style}
                onClick={onClick}
            >
                <Glyphicon glyph={glyph}/>
            </Button>
        );
    }
    return null;
}

FullScreen.defaultProps = {};

FullScreen.propTypes = {
    onClick: PropTypes.func,
    glyph: PropTypes.string,
    style: PropTypes.object
};

export default FullScreen;
