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
import FeaturesTable from '../FeaturesTable';

describe('FeaturesTable component', () => {
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
        ReactDOM.render(<FeaturesTable />, document.getElementById("container"));
        const container = document.getElementById('container');
        const featuresTableNode = container.querySelector('.ms-viewer-features-table');
        expect(featuresTableNode).toBeTruthy();
    });
    it('render with data', () => {
        const data = {
            cols: [
                {
                    value: 'msEventsTracker.feature',
                    labelId: 'msEventsTracker.feature'
                },
                {
                    value: '*',
                    labelId: 'msEventsTracker.categories.all',
                    color: '#333333'
                }
            ],
            ranges: {
                '*': {
                    min: 0,
                    max: 100,
                    color: '#333333'
                }
            },
            rows: [
                {
                    feature: '1',
                    '*': 100,
                    '@props': {
                        selected: false,
                        selectedHref: '#/?feature=1'
                    }
                },
                {
                    feature: '2',
                    '*': 50,
                    '@props': {
                        selected: true,
                        selectedHref: '#/'
                    }
                }
            ]
        };
        ReactDOM.render(<FeaturesTable data={data} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const featuresTableNode = container.querySelector('.ms-viewer-features-table');
        expect(featuresTableNode).toBeTruthy();
        const tBodyNode = featuresTableNode.querySelector('tbody');
        expect(tBodyNode).toBeTruthy();
        const rowsNodes = tBodyNode.querySelectorAll('tr');
        expect(rowsNodes.length).toBe(2);
        expect(rowsNodes[0].querySelector('.glyphicon-unchecked')).toBeTruthy();
        expect(rowsNodes[1].querySelector('.glyphicon-check')).toBeTruthy();
    });
});
