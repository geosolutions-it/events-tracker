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
import Counters from '../Counters';

describe('Counters component', () => {
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
        ReactDOM.render(<Counters/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const countersNode = container.querySelector('.ms-viewer-counters');
        expect(countersNode).toBeTruthy();
    });
    it('render with options', () => {
        const options = [{
            color: "#333333",
            count: 100,
            href: "#/",
            id: "cat1",
            labelId: "cat1Message",
            selected: true,
            value: "CAT-1"
        }, {
            color: "#FF0000",
            count: 50,
            href: "#/?category=CAT-2",
            id: "cat2",
            labelId: "cat2Message",
            selected: false,
            value: "CAT-2"
        }];
        ReactDOM.render(<Counters options={options}/>, document.getElementById("container"));
        const container = document.getElementById('container');
        const countersNode = container.querySelector('.ms-viewer-counters');
        expect(countersNode).toBeTruthy();
        const counterCardNode = countersNode.querySelectorAll('.ms-viewer-counter');
        expect(counterCardNode.length).toBe(2);
        expect(counterCardNode[0].getAttribute('class')).toBe('ms-viewer-counter selected has-link');
        expect(counterCardNode[0].querySelector('a').getAttribute('href')).toBe('#/');
        expect(counterCardNode[0].querySelector('.ms-viewer-counter-count > span').innerHTML).toBe('100');
        expect(counterCardNode[1].getAttribute('class')).toBe('ms-viewer-counter has-link');
        expect(counterCardNode[1].querySelector('a').getAttribute('href')).toBe('#/?category=CAT-2');
        expect(counterCardNode[1].querySelector('.ms-viewer-counter-count > span').innerHTML).toBe('50');
    });
});
