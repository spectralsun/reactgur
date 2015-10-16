import React from 'react';
import xhttp from 'xhttp';
import {Modal, Button, Input, Alert} from 'react-bootstrap';

import ee from './../Emitter.js';

import ModalComponent from '../components/ModalComponent.js'

import RegistrationForm from './../forms/RegistrationForm.js'

export default class RegisterModal extends ModalComponent
{
    constructor(props) {
        super(props)
        ee.addListener('route:/register', this.open.bind(this));
    }

    componentDidUpdate() {
        if (this.refs.registrationForm)
            this.refs.registrationForm.ee.removeAllListeners('success')
                                         .addListener('success', this.handleRegistrationSuccess.bind(this));
    }

    handleRegistrationSuccess(data) {
        if (data && data.request_received) 
            ee.emit('alert', {
                msg: 'Registration request received. You will receive an email when an admin approves your request.',
                style: 'success'
            })
        else
            ee.emit('update_app_data', data);
        this.close();
    }

    open(props) {
        if (this.props.user.username)
            return window.history.pushState({}, '', '/');
        super.open(props)
    }

    submit() {
        this.refs.registrationForm.submit();
    }

    render() {
        return (   
            <Modal show={this.state.show} onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Register</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RegistrationForm ref='registrationForm' />
                    <hr/>
                    <div className='text-center'>
                        Already registered? Login <a href='/login'>here</a>.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close.bind(this)}>Close</Button>
                    <Button onClick={this.submit.bind(this)}>Submit</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}