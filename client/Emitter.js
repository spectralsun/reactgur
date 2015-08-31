import EventEmitter from 'events';

const Emitter = new EventEmitter()

window.onresize = (e) => {
    Emitter.emit('resize', e);
}

export default Emitter;