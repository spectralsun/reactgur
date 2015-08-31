import React from 'react';

import HomePage from '../pages/HomePage.js';

import ee from '../Emitter.js';

export default class PagesComponent extends React.Component
{
    constructor(props) {
        super(props);
        this.last_path = '/';
        ee.addListener('modal_close', this.onModalClose.bind(this)); 
    }
    
    onModalClose(modal) {
        history.pushState({}, '', this.last_path);
    }

    render() {
        return (
            <div id="page" className="container">
                 <HomePage ref="homePage" />
            </div>
        );
    }
}