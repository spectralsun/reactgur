import React from 'react';
import xhttp from 'xhttp';
import {Modal, Button, Input, Alert, ProgressBar} from 'react-bootstrap';
import EventEmitter from 'events';

import ee from './../Emitter.js';
import ModalComponent from './../components/ModalComponent.js';

const max_parallel_uploads = 2;

class FileUploadQueue
{
    constructor() {
        this.queue = [];
        this.current_upload_count = 0;
    }

    checkQueue() {
        if (this.queue.length > 0)
            this.upload(this.queue.shift());
    }

    enterQueue(fileUpload) {
        if (this.current_upload_count >= max_parallel_uploads)
            return this.queue.push(fileUpload);
        this.upload(fileUpload);
    }

    upload(fileUpload) {
        fileUpload.ee.addListener('load', this.onUploadFinish.bind(this));
        fileUpload.ee.addListener('error', this.onUploadFinish.bind(this));
        fileUpload.ee.addListener('abort', this.onUploadFinish.bind(this));
        this.current_upload_count++;
        fileUpload.upload()
    }

    onUploadFinish() {
        this.current_upload_count--;
        this.checkQueue();
    }
}

const fileUploadQueue = new FileUploadQueue();

class FileUpload 
{
    constructor(file) {
        this.file = file;
        this.content = 'Content-Disposition: form-data; name="files[]"; filename="' + file.name + '"\r\nContent-Type: ' + file.type + '\r\n\r\n';
        this.fileReader = new FileReader();
        this.fileReader.onload = this.queue.bind(this);
        this.ee = new EventEmitter();
    }

    queue(e) {
        this.content += e.target.result + '\r\n';
        fileUploadQueue.enterQueue(this);
    }

    upload(e) {
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
        return (e) => { ee.emit(ns, e) }
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
        ee.addListener('route:/upload', this.checkUploadPrivilege.bind(this));
    }

    checkUploadPrivilege() {
        if (APP_CONF.upload_login_required && !APP_DATA.authed) 
            return;
        this.open();
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
                            <input type="file" name="file" multiple onChange={this.onInputChange.bind(this)} />
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
