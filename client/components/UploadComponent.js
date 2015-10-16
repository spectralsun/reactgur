import React from 'react';
import {ProgressBar} from 'react-bootstrap';

import FileUpload from './../upload/FileUpload.js';


export default class UploadComponent extends React.Component
{
    constructor(props) {
        super(props)
        this.upload = new FileUpload(this.props.file);
        this.upload.ee.addListener('load', this.handleLoad.bind(this));
        this.upload.ee.addListener('loadstart', this.handleLoadStart.bind(this));
        this.upload.ee.addListener('progress', this.handleProgress.bind(this));
        this.upload.ee.addListener('error', this.handleError.bind(this));
        this.upload.ee.addListener('abort', this.handleAbort.bind(this));
        this.upload.ee.addListener('readystatechange', this.onReadyStateChange.bind(this));
        this.state = { progress: 0 }
    }

    componentDidMount() {
        this.upload.start();
    }

    handleLoadStart(e) {
        this.setState({ progress: (e.loaded/e.total) * 100 });
    }

    handleLoad(e) {
        this.setState({ progress: (e.loaded/e.total) * 100 });
        this.props.ee.emit('load');
    }

    onReadyStateChange(e) {
        if (e.target.readyState == 4 && e.target.status == 200) {
            if (e.target.status == 200)
                this.props.ee.emit('uploaded', JSON.parse(e.target.responseText));
            else
                this.props.ee.emit('failed', JSON.parse(e.target.responseText));
        }
    }

    handleProgress(e) {
        this.setState({ progress: (e.loaded/e.total) * 100 });
    }

    handleError(e) {
        console.log(e)
    }

    handleAbort(e) {
        console.log(e)
    }

    render() {
        return (
            <ProgressBar bsStyle='success' now={this.state.progress} />
        );
    }
}