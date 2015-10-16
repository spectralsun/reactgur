import React from 'react';
import NotificationSystem from 'react-notification-system';
import xhttp from 'xhttp';

import NavbarComponent from './components/NavbarComponent.js';
import PagesComponent from './components/PagesComponent.js';

import ConfirmModal from './modals/ConfirmModal.js';
import LoginModal from './modals/LoginModal.js';
import RegisterModal from './modals/RegisterModal.js';
import UploadModal from './modals/UploadModal.js';

import ee from './Emitter.js';


class Reactgur extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = { user: APP_DATA.user }
    }
    
    componentDidMount() {
        this._notificationSystem = this.refs.notificationSystem;

        // Don't change the push state for these routes
        const no_push_state = [
            '/logout'
        ];
        // Catch-All click handler
        document.body.addEventListener('click', (e) => {
            var link = e.target;
            // Bubble up the chain to check for a link
            while (!link.pathname && link.parentNode)
                link = link.parentNode;

            // Ignore links with 'allow' class
            if (link.className && link.className.indexOf('allow') != -1)
                return;

            if (link.pathname) {
                e.preventDefault();
                if (no_push_state.indexOf(link.pathname) == -1) 
                    history.pushState({}, '', link.pathname + link.search + link.hash);
                this.path_change(link.pathname);
            }
        });
        // Listen for user popping history state
        window.onpopstate = () => {
            this.path_change(document.location.pathname);
            
        }
        // Logout route listener
        ee.addListener('route:/logout', () => {
            xhttp({
                url: '/api/v1/logout',
                method: 'post',
                headers: { 'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content }
            })
            .then((data) => {
                reactgur.setState({user: data});
            })
        });
        // Update from the current pathname
        this.path_change(document.location.pathname);
    }

    addNotification(data) {
        this._notificationSystem.addNotification(data);
    }

    path_change(path) {
        var emit_path = path;
        if (path.indexOf('/i/') === 0) {
            emit_path = '/i/:image';
        }
        ee.emit('route:' + emit_path);
    }

    render() {
        return (
            <div id="app">
                <NavbarComponent user={this.state.user} ref="navbarComponent"/>
                <PagesComponent user={this.state.user} ref="pageComponent"/>
                <LoginModal refs="loginModal"/>
                <RegisterModal refs="registerModal"/>
                <UploadModal refs="uploadModal"/>
                <ConfirmModal ref='confirmModal' />
                <NotificationSystem ref='notificationSystem' />
            </div>
        );
    }
}

window.reactgur = React.render(<Reactgur/>, document.getElementById('entry'));
/*\
|*|
|*|  :: XMLHttpRequest.prototype.sendAsBinary() Polyfill ::
|*|
|*|  https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#sendAsBinary()
\*/
if (!XMLHttpRequest.prototype.sendAsBinary) {
  XMLHttpRequest.prototype.sendAsBinary = function(sData) {
    var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
    for (var nIdx = 0; nIdx < nBytes; nIdx++) {
      ui8Data[nIdx] = sData.charCodeAt(nIdx) & 0xff;
    }
    /* send as ArrayBufferView...: */
    this.send(ui8Data);
    /* ...or as ArrayBuffer (legacy)...: this.send(ui8Data.buffer); */
  };
}