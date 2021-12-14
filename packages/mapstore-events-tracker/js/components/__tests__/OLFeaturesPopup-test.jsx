/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import expect from 'expect';
import OLFeaturesPopup from '../OLFeaturesPopup';
import { act } from 'react-dom/test-utils';

describe('OLFeaturesPopup component', () => {
    beforeEach((done) => {
        document.body.innerHTML = '<div id="container"></div>';
        setTimeout(done);
    });
    afterEach((done) => {
        ReactDOM.unmountComponentAtNode(document.getElementById("container"));
        document.body.innerHTML = '';
        setTimeout(done);
    });
    it('render with default props', () => {
        act(() => {
            ReactDOM.render(<OLFeaturesPopup />, document.getElementById("container"));
        });
        const container = document.getElementById('container');
        expect(container.innerHTML).toBe('');
    });
});
