import React from 'react';

import ee from './../Emitter.js';


class ModalLock 
{
    constructor() {
        this.removeLock()
        ee.addListener('close_open_modal', this.closeOpenModal.bind(this));
    }
    closeOpenModal() {
        if (this.modal) {
            this.modal.close({}, '', true)
            this.removeLock();
        }
    }
    setLock(modal) {
        this.modal = modal;
    }
    getLock(){
        return this.modal;
    }
    removeLock() {
        this.modal = null;
    }
}

const lock = new ModalLock();

export default class ModalComponent extends React.Component 
{
    constructor(props) {
        super(props)
        this.state = { show: false };
    }

    open() {
        if (lock.getLock()) {
            lock.getLock().close(true)
        }
        lock.setLock(this);
        this.setState({ show: true });
        ee.emit('modal_open', this);
    }

    close(e, id, dontemit) {
        this.setState({ show: false });
        if (!dontemit)
            ee.emit('modal_close', this);
    }
}