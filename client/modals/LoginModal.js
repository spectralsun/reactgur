import React from 'react';
import xhttp from 'xhttp';
import {Modal, Button, Input, Alert} from 'react-bootstrap';

import ee from './../Emitter.js';
import ModalComponent from './../components/ModalComponent.js';
import LoginForm from './../forms/LoginForm.js';


export default class LoginModal extends ModalComponent
{
    constructor(props) {
        super(props)
        ee.addListener('route:/login', this.open.bind(this));
        ee.addListener('route:/upload', this.checkUploadPrivilege.bind(this))
    }

    componentDidUpdate() {
        if (this.refs.loginForm)
            this.refs.loginForm.ee.removeAllListeners('success')
                                  .addListener('success', this.handleLoginSuccess.bind(this));
    }
    checkUploadPrivilege() {
        if (APP_CONF.upload_requires_login && !APP_DATA.username) {
            this.open();
            history.pushState({}, '', '/login');
            this.open_upload_on_login = true;
        }
    }

    open() {
        this.open_upload_on_login = false;
        super.open();
    }

    submit() {
        this.refs.loginForm.submit();
    }

    handleLoginSuccess(data) {
        if (this.open_upload_on_login) {
            history.pushState({}, '', '/upload');
            ee.emit('route:/upload');
        } else 
            this.close();
    }

    render() {
        return (   
            <Modal show={this.state.show} onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <LoginForm ref="loginForm"/>
                    <hr/>
                    <div className="text-center">
                        Register for free <a href="/register">here</a>.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close.bind(this)}>Close</Button>
                    <Button onClick={this.submit.bind(this)}>Submit</Button>
                </Modal.Footer>
            </Modal>
        )
    }
};
