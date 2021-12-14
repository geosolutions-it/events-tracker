/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef } from 'react';

// based on https://stackoverflow.com/questions/32553158/detect-click-outside-react-component

/**
 * Detect a click out event given a target node
 * @name useDetectClickOut
 * @memberof hooks
 * @prop {boolean} disabled ensure the callback is not triggered
 * @prop {function} onClickOut callback on click outside the targeted node
 * @example
 * function Panel({ onClose }) {
 *  const targetedNode = useDetectClickOut({ onClickOut: onClose });
 *  return (
 *      <div ref={targetedNode}></div>
 *  );
 * }
 */
function useDetectClickOut({
    disabled,
    onClickOut
}) {
    const node = useRef();
    useEffect(() => {
        function handleClickOut(event) {
            const nodeContains = !disabled && node?.current?.contains;
            if (nodeContains && !node.current.contains(event.target)) {
                onClickOut();
            }
        }
        window.addEventListener('mousedown', handleClickOut);
        return () => {
            window.removeEventListener('mousedown', handleClickOut);
        };
    }, [ disabled, node, onClickOut ]);
    return node;
}

export default useDetectClickOut;
