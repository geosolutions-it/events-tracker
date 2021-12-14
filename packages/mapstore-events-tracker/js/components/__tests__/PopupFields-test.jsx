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
import PopupFields from '../PopupFields';

describe('PopupFields component', () => {
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
        ReactDOM.render(<PopupFields />, document.getElementById("container"));
        const container = document.getElementById('container');
        const popupNode = container.querySelector('.ms-feature-popup');
        expect(popupNode).toBeTruthy();
    });
    it('should render with fields', () => {
        const fields = [
            { value: 200, labelId: 'category', color: '#ff0000' },
            { value: 10, labelId: 'count' },
            { value: 100, labelId: 'population' }
        ];
        ReactDOM.render(<PopupFields
            fields={fields}
        />, document.getElementById("container"));
        const container = document.getElementById('container');
        const popupNode = container.querySelector('.ms-feature-popup');
        expect(popupNode).toBeTruthy();

        const fieldsNodes = popupNode.querySelectorAll('li');
        expect(fieldsNodes.length).toBe(3);
        expect([...fieldsNodes].map((node) => node.style.borderColor)).toEqual(
            [ 'rgb(255, 0, 0)', '', '' ]
        );

        const fieldsLabelNodes = popupNode.querySelectorAll('.ms-feature-popup-label');
        expect(fieldsLabelNodes.length).toBe(3);
        expect([...fieldsLabelNodes].map((node) => node.innerHTML)).toEqual(
            [ '<span>category</span>:', '<span>count</span>:', '<span>population</span>:' ]
        );

        const fieldsValueNodes = popupNode.querySelectorAll('.ms-feature-popup-value');
        expect(fieldsValueNodes.length).toBe(3);
        expect([...fieldsValueNodes].map((node) => node.innerHTML)).toEqual(
            [ '200', '10', '100' ]
        );
    });
    it('render with title and selected feature', () => {
        const title = 'Feature';
        const featureHref = "#/";
        const isFeatureSelected = true;
        ReactDOM.render(<PopupFields title={title} featureHref={featureHref} isFeatureSelected={isFeatureSelected} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const popupNode = container.querySelector('.ms-feature-popup');
        expect(popupNode).toBeTruthy();
        const linkNode = popupNode.querySelector('a');
        expect(linkNode).toBeTruthy();
        expect(linkNode.getAttribute('href')).toBe(featureHref);
        const titleNode = popupNode.querySelector('h4');
        expect(titleNode).toBeTruthy();
        expect(titleNode.innerText).toBe(title);
        const checkboxNode = popupNode.querySelector('.glyphicon');
        expect(checkboxNode.getAttribute('class')).toBe('glyphicon glyphicon-check');
    });
    it('render with title and not selected feature', () => {
        const title = 'Feature';
        const featureHref = "#/?feature=1";
        const isFeatureSelected = false;
        ReactDOM.render(<PopupFields title={title} featureHref={featureHref} isFeatureSelected={isFeatureSelected} />, document.getElementById("container"));
        const container = document.getElementById('container');
        const popupNode = container.querySelector('.ms-feature-popup');
        expect(popupNode).toBeTruthy();
        const linkNode = popupNode.querySelector('a');
        expect(linkNode).toBeTruthy();
        expect(linkNode.getAttribute('href')).toBe(featureHref);
        const titleNode = popupNode.querySelector('h4');
        expect(titleNode).toBeTruthy();
        expect(titleNode.innerText).toBe(title);
        const checkboxNode = popupNode.querySelector('.glyphicon');
        expect(checkboxNode.getAttribute('class')).toBe('glyphicon glyphicon-unchecked');
    });
});
