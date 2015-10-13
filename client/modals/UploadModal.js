import EventEmitter from 'events';
import React from 'react';
import xhttp from 'xhttp';
import {Modal, Button, Input, Alert} from 'react-bootstrap';

import ee from './../Emitter.js';
import ModalComponent from './../components/ModalComponent.js';
import UploadComponent from './../components/UploadComponent.js';


export default class UploadModal extends ModalComponent
{
    constructor(props) {
        super(props)
        this.uploads = []
        this.state = { uploads: 0 }
        ee.addListener('route:/upload', this.checkUploadPrivilege.bind(this));
    }

    checkUploadPrivilege() {
        if (APP_CONF.upload_requires_login && !APP_DATA.user.username) 
            return;
        this.open();
    }

    handleInputChange(e) {
        for (var x = 0; x < e.target.files.length; x++) {
            var ee = new EventEmitter();
            var upload = <UploadComponent key={x} 
                                          ee={ee} 
                                          file={e.target.files[x]} />;
            ee.addListener('load', this.handleUploadFinish.bind(this));
            this.uploads.push(upload);
        }
        this.setState({uploads: this.uploads.length })
    }

    handleUploadFinish() {
        var upload_count = this.state.uploads - 1;
        if (upload_count == 0) {
            this.uploads = [];
        }
        this.setState({ show: upload_count > 0, uploads: upload_count });
    }

    cancel() {

    }

    close(props) {
        if (this.state.uploads > 0) 
            return;
        super.close(props)
    }
    
    render() {
        return (   
            <Modal show={this.state.show} onHide={this.close.bind(this)}>
                {this.state.uploads > 0 ? (
                    <Modal.Header>
                        <Modal.Title>Uploading Images...</Modal.Title>
                    </Modal.Header>
                ) : (
                    <Modal.Header closeButton>
                        <Modal.Title className="text-center">
                            <span className="glyphicon glyphicon-cloud-upload"></span> 
                            <span> Upload Images</span>
                        </Modal.Title>
                    </Modal.Header>
                )}
                <Modal.Body className="text-center">
                    {this.state.uploads == 0 ? (
                        <span id="upload_button" className="btn btn-success btn-lg">
                            <i className="glyphicon glyphicon-plus"/>
                            <span> Select files...</span>
                            <input type="file" name="file" multiple onChange={this.handleInputChange.bind(this)} />
                        </span>
                    ) : null}
                    <div>
                        {this.uploads}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {this.state.uploads == 0 ? (
                        <Button onClick={this.close.bind(this)}>Close</Button>
                    ) : (
                        <Button bsStyle="danger" onClick={this.cancel.bind(this)}>Cancel</Button>
                    )}
                </Modal.Footer>
            </Modal>
        )
    }
}
