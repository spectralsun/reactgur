import React from 'react';
import xhttp from 'xhttp';
import {Modal, Button, Input, Alert, ProgressBar} from 'react-bootstrap';
import EventEmitter from 'events';

import ee from './../Emitter.js';
import ModalComponent from './../components/ModalComponent.js';


class FileUpload 
{
    constructor(file) {
        this.file = file;
        this.content = 'Content-Disposition: form-data; name="files[]"; filename="' + file.name + '"\r\nContent-Type: ' + file.type + '\r\n\r\n';
        this.fileReader = new FileReader();
        this.fileReader.onload = this.onLoad.bind(this);
        this.ee = new EventEmitter();
    }

    onLoad(e) {
        this.content += e.target.result + '\r\n';
        var boundary = "---------------------------" + Date.now().toString(16);
        var ajax = new XMLHttpRequest();
        ajax.upload.addEventListener('progress', this.createEmitter('progress'), false);
        ajax.upload.addEventListener('load', this.createEmitter('load'), false);
        ajax.upload.addEventListener('error', this.createEmitter('error'), false);
        ajax.upload.addEventListener('abort', this.createEmitter('abort'), false);
        ajax.open('post', '/upload', true);
        ajax.setRequestHeader('Content-Type', 'multipart\/form-data; boundary=' + boundary);
        ajax.setRequestHeader('X-CSRFToken', document.querySelector('meta[name="csrf-token"]').content);
        ajax.sendAsBinary('--' + boundary + '\r\n' + this.content + '\r\n--' + boundary + '--\r\n')
    }

    createEmitter(ns) {
        var ee = this.ee;
        return (e) => {
            ee.emit(ns, e)
        }
    }

    start() {
        this.fileReader.readAsBinaryString(this.file);
    }
}

class UploadComponent extends React.Component
{
    constructor(props) {
        super(props)
        this.upload = new FileUpload(this.props.file);
        this.upload.ee.addListener('progress', this.onProgress.bind(this));
        this.upload.ee.addListener('load', this.onLoad.bind(this));
        this.upload.ee.addListener('error', this.onError.bind(this));
        this.upload.ee.addListener('abort', this.onAbort.bind(this));
        this.state = { progress: 0 }
    }

    componentDidMount() {
        this.upload.start();
    }

    onProgress(e) {
        this.setState({ progress: (e.loaded/e.total) * 100 });
    }

    onLoad(e) {
        this.setState({ progress: (e.loaded/e.total) * 100 });
        this.props.ee.emit('load');
    }

    onError(e) {
        console.log(e)
    }

    onAbort(e) {
        console.log(e)
    }

    render() {
        return (
            <ProgressBar bsStyle='success' now={this.state.progress} />
        );
    }
}

export default class UploadModal extends ModalComponent
{
    constructor(props) {
        super(props)
        this.uploads = []
        this.state = { uploads: 0 }
        ee.addListener('push_state:/upload', this.open.bind(this));
    }


    onInputChange(e) {
        for (var x = 0; x < e.target.files.length; x++) {
            var ee = new EventEmitter();
            var upload = <UploadComponent key={x} ee={ee} file={e.target.files[x]} />;
            ee.addListener('load', this.onUploadFinish.bind(this));
            this.uploads.push(upload);
        }
        this.setState({uploads: this.uploads.length })
    }

    onUploadFinish() {
        this.setState({ uploads: this.state.uploads - 1 });
        if (this.state.uploads == 0) {
            this.uploads = [];
            this.close();
        }
    }

    close(props) {
        if (this.state.uploads > 0) 
            return;
        super.close(props)
    }
    
    render() {
        console.log(this.uploads)
        return (   
            <Modal show={this.state.show} onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Images</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <input type="file" name="file" multiple onChange={this.onInputChange.bind(this)} />
                    </form>
                    <div>
                        {this.uploads}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close.bind(this)}>Close</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}
