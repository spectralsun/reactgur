import React from 'react';

import HomePage from '../pages/HomePage.js';

import ee from '../Emitter.js';

export default class PagesComponent extends React.Component
{
    constructor(props) {
        super(props);
        this.last_path = '/';
        ee.addListener('modal_close', this.onModalClose.bind(this)); 
        ee.addListener('resize', this.handleResize.bind(this));
    }

    componentDidMount() {
        this.refs.page_wrapper.getDOMNode().style.height = (window.innerHeight - 51) + 'px';
        ee.emit('page_wrapper', this.refs.page_wrapper);
    }
    
    onModalClose(modal) {
        history.pushState({}, '', this.last_path);
    }

    handleResize() {
        if (this.refs.page_wrapper)
            this.refs.page_wrapper.getDOMNode().style.height = (window.innerHeight - 51) + 'px';
    }

    handleScroll(e) {
        ee.emit('wrapper_scroll', e);
    }

    render() {
        return (
            <div id='page_wrapper' ref='page_wrapper' onScroll={this.handleScroll.bind(this)}>
                <div id="page" className="container">
                     <HomePage ref="homePage" />
                </div>
            </div>
        );
    }
}