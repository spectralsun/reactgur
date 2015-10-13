import EventEmitter from 'events';

import fileUploadQueue from './FileUploadQueue.js';

export default class FileUpload 
{
    constructor(file) {
        this.content = 'Content-Disposition: form-data; name="files[]"; filename="' + file.name + '"\r\nContent-Type: ' + file.type + '\r\n\r\n';
        this.ee = new EventEmitter();
        this.file = file;
        this.fileReader = new FileReader();
        this.fileReader.onload = this.queue.bind(this);
    }

    queue(e) {
        this.content += e.target.result + '\r\n';
        fileUploadQueue.enterQueue(this);
    }

    upload(e) {
        var boundary = "---------------------------" + Date.now().toString(16);
        var request = new XMLHttpRequest();
        request.upload.onprogress = this.createEmitter('progress');
        request.upload.onload = this.createEmitter('load');
        request.upload.onloadstart = this.createEmitter('loadstart');
        request.upload.onloadend = this.createEmitter('loadend');
        request.upload.onerror = this.createEmitter('error');
        request.upload.onabort = this.createEmitter('abort');
        request.onreadystatechange = this.createEmitter('readystatechange');
        request.open('post', '/api/v1/media', true);
        request.setRequestHeader('Content-Type', 'multipart\/form-data; boundary=' + boundary);
        request.setRequestHeader('X-CSRFToken', document.querySelector('meta[name="csrf-token"]').content);
        request.sendAsBinary('--' + boundary + '\r\n' + this.content + '\r\n--' + boundary + '--\r\n')
    }

    createEmitter(ns) {
        var ee = this.ee;
        return (e) => { ee.emit(ns, e) }
    }

    start() {
        this.fileReader.readAsBinaryString(this.file);
    }
}
