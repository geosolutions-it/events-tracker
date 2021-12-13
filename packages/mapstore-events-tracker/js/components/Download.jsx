import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ResizableModal from '@mapstore/framework/components/misc/ResizableModal';
import Portal from '@mapstore/framework/components/misc/Portal';
import { Glyphicon, Button, InputGroup, Checkbox } from 'react-bootstrap';
import {
    getDataFileName,
    getBaseLayerName,
    downloadZip
} from '@js/utils/DownloadUtils';
import Message from '@mapstore/framework/components/I18N/HTML';

function Download({ layers, viewer, viewerConfig, normalizer}, {messages}) {
    const [show, setShow] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const files = [
        {name: "readme.html", folder: "", descId: "msEventsTracker.download.readmeDesc", include: true},
        {name: `${getBaseLayerName(messages)}.json`, folder: "base/", descId: "msEventsTracker.download.baseLayerDesc", include: true},
        {name: `${getDataFileName(messages)}.json`, folder: "aggregated/", descId: "msEventsTracker.download.aggregatedLayerDesc", include: true},
        {name: `${getDataFileName(messages)}.csv`, folder: "aggregated/", descId: "msEventsTracker.download.aggregatedDataDesc", include: true},
        {name: `${getDataFileName(messages)}.csv`, folder: "timeseries/", descId: "msEventsTracker.download.timeseriesDataDesc", include: true}
    ];
    const [checkedState, setCheckedState] = useState(
        new Array(files.length).fill(true)
    );

    const handleOnChange = (position) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === position ? !item : item
        );
        setDisabled(updatedCheckedState.indexOf(true) === -1);
        setCheckedState(updatedCheckedState);
    };

    return (
        <>
            <div onClick={() => setShow(true)}>
                <Glyphicon glyph="download-alt" />
                Download
            </div>
            <Portal>
                <ResizableModal
                    title={<Message msgId="msEventsTracker.download.download" />}
                    bodyClassName="download-win"
                    show={show}
                    onClose={() => setShow(false)}
                >
                    <div className="options">
                        <h4><strong><Message msgId="msEventsTracker.download.options" /></strong></h4>
                        <InputGroup>
                            {files.map(({folder, name, descId}, index) => {
                                return (
                                    <Checkbox
                                        key={`${index}${checkedState[index]}`}
                                        checked={checkedState[index]}
                                        onChange={() => handleOnChange(index)}
                                    >
                                        <strong>{`/${folder}${name}`}</strong><br/>
                                        <Message msgId={descId} />
                                    </Checkbox>
                                );
                            })}
                        </InputGroup>
                    </div>
                    <div className="btns">
                        <Button onClick={() => setShow(false)} className="btn-primary">
                            <Glyphicon glyph="remove" />
                            <Message msgId="msEventsTracker.cancel" />
                        </Button>
                        <Button
                            disabled={disabled ? true : false}
                            onClick={
                                () => {
                                    downloadZip({
                                        files: files.filter((file, index) => checkedState[index]),
                                        checkedState, layers, viewer, viewerConfig, normalizer, messages});
                                    setShow(false);
                                }
                            }
                            className="btn-primary"
                        >
                            <Glyphicon glyph="download-alt" />
                            <Message msgId="msEventsTracker.download.download" />
                        </Button>
                    </div>
                </ResizableModal>
            </Portal>
        </>
    );
}

Download.contextTypes = {
    messages: PropTypes.object
};

Download.propTypes = {
    layers: PropTypes.object,
    viewer: PropTypes.object
};

export default Download;
