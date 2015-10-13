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
        fileUpload.ee.addListener('load', this.handleUploadFinish.bind(this));
        fileUpload.ee.addListener('error', this.handleUploadFinish.bind(this));
        fileUpload.ee.addListener('abort', this.handleUploadFinish.bind(this));
        this.current_upload_count++;
        fileUpload.upload()
    }

    handleUploadFinish() {
        this.current_upload_count--;
        this.checkQueue();
    }
}

const fileUploadQueue = new FileUploadQueue();

export default fileUploadQueue;