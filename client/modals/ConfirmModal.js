import React from 'react';
import {Modal, Button} from 'react-bootstrap';

import ModalComponent from './../components/ModalComponent.js';


export default class ConfirmModal extends ModalComponent
{
    constructor(props) {
        super(props)
        this.setState({title: '', message: '', confirm: 'Confirm', cancel: 'Cancel'})
    }

    handleCancel() {
        this.callback(false);
        this.close()
    }

    handleConfirm() {
        this.callback(true);
        this.close();
    }

    open(callback) {
        this.callback = callback;
        super.open();
    }

    render() {
        return (   
            <Modal show={this.state.show} onHide={this.close.bind(this)} className='text-center'>
                <Modal.Header>
                    <Modal.Title>{this.state.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{this.state.message}</p>
                    <div className='text-right'>
                        <Button bsStyle='danger'
                                className='pull-left' 
                                onClick={this.handleConfirm.bind(this)}>{this.state.confirm}</Button>
                        <Button bsStyle='success'
                                onClick={this.handleCancel.bind(this)}>{this.state.cancel}</Button>
                    </div>
                </Modal.Body>
            </Modal>
        )
    }
};
