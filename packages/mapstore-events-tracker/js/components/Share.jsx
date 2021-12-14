import React, { useState, useEffect } from 'react';
import ShareLink from '@mapstore/framework/components/share/ShareLink';
import ResizableModal from '@mapstore/framework/components/misc/ResizableModal';
import Portal from '@mapstore/framework/components/misc/Portal';
import { Glyphicon } from 'react-bootstrap';
import ShareQRCode from '@mapstore/framework/components/share/ShareQRCode';
import ShareSocials from '@mapstore/framework/components/share/ShareSocials';
import Message from '@mapstore/framework/components/I18N/HTML';

function Share({}) {
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (copied) {
            setTimeout(() => {
                setCopied(false);
            }, 1000);
        }
    }, [copied]);
    const [show, setShow] = useState(false);
    return (
        <>
            <div onClick={() => setShow(true)}>
                <Glyphicon glyph="share" />
                <Message msgId="share.title" />
            </div>
            <Portal>
                <ResizableModal
                    title={<Message msgId="share.titlePanel" />}
                    bodyClassName="share-win"
                    show={show}
                    onClose={() => setShow(false)}
                >
                    <ShareLink shareUrl={window.location.href} />
                    <ShareQRCode shareUrl={window.location.href} />
                    <ShareSocials shareUrl={window.location.href} />
                </ResizableModal>
            </Portal>
        </>
    );
}

export default Share;
