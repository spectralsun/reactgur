import React from 'react';
import xhttp from 'xhttp';
import {Modal, Button, Input, Alert} from 'react-bootstrap';

import ee from './../Emitter.js';
import ModalComponent from './../components/ModalComponent.js';


export default class LoginModal extends ModalComponent
{
    constructor(props) {
        super(props)
        ee.addListener('push_state:/login', this.open.bind(this));
    }

    submit() {
        var modal = this;
        var data = {
            username: document.querySelector('[name="username"]').value,
            password: document.querySelector('[name="password"]').value,
        }

        xhttp({
            url: '/login',
            method: 'post',
            headers: {
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
            },
            data: data
        })

        .then(this.onLoginSuccess.bind(this))

        .catch(this.onLoginFailure.bind(this));
    }

    onLoginSuccess(data) {
        ee.emit('update_app_data', data);
        this.close();
    }

    onLoginFailure(data) {
        if (data) {
            this.setState({ errors: data });
            console.log(data, this.state)
        }
    }

    onKeyDown(e) {
        if (e.keyCode == 13)
            this.submit()
    }
    
    render() {
        var errors = this.state.errors;
        this.state.errors = null;
        let get_error = (name) => {
            if (errors && errors[name])
                return (
                    <Alert bsStyle='danger'>{errors[name]}</Alert>
                )
            return null;
        }
        return (   
            <Modal show={this.state.show} onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <Input type='text' label='Username or Email' placeholder='Enter email/username' name='username' onKeyDown={this.onKeyDown.bind(this)} />
                        {get_error('username')}
                        <Input type='password' label='Password' name='password' />
                        {get_error('password')}
                    </form>
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
