import React from 'react';
import {Alert} from 'react-bootstrap';

import HomePage from '../pages/HomePage.js';

import ee from '../Emitter.js';

export default class PagesComponent extends React.Component
{
    constructor(props) {
        super(props);
        this.last_path = '/';
        this.state = {alerts: APP_DATA.alerts}
        ee.addListener('alert', this.handleAlert.bind(this));
        ee.addListener('modal_close', this.handleModalClose.bind(this)); 
        ee.addListener('resize', this.handleResize.bind(this));
    }

    componentDidMount() {
        this.refs.page_wrapper.getDOMNode().style.height = (window.innerHeight - 51) + 'px';
    }
    
    handleModalClose(modal) {
        history.pushState({}, '', this.last_path);
    }

    handleAlert(alert) {
        this.setState({alerts: [].concat(this.state.alerts, [alert]) });
    }

    handleAlertDismiss(e) {
        var alert = e.target;
        while (alert.className.indexOf('alert') == -1) 
            alert = alert.parentNode;
        this.state.alerts.splice(parseInt(alert.dataset.index), 1)
        this.setState({alerts: this.state.alerts})
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
                <div className="container">
                {this.state.alerts.map((alert, k) => {
                    return (<Alert data-index={k} 
                                   bsStyle={alert.style}
                                   onDismiss={this.handleAlertDismiss.bind(this)}>{alert.msg}</Alert>)
                })}
                </div>
                <div id="page" className="container">
                     <HomePage user={this.props.user} ref="homePage" />
                </div>
            </div>
        );
    }
}