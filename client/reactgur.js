import React from 'react';
import Router, {Route, RouteHandler} from 'react-router';
import xhttp from 'xhttp';

import HomePage from './pages/HomePage.js';

import LoginModal from './modals/LoginModal.js';
import RegisterModal from './modals/RegisterModal.js';
import UploadModal from './modals/UploadModal.js';

import NavbarComponent from './components/NavbarComponent.js';

import ee from './Emitter.js';

var current_layout;

let render_app = (Page) => {
    current_layout = (
        <div id="app">
            <NavbarComponent/>
            <div className="container">
                <Page/>
            </div>
            <RegisterModal/>
            <LoginModal/>
            <UploadModal/>
        </div>
    )
    React.render(current_layout, document.getElementById('entry'));
}
let rerender_app = () => {
    React.render(current_layout, document.getElementById('entry'));
}
ee.addListener('render', rerender_app);

ee.addListener('update_app_data', (data) => {
    window.APP_DATA = data;
    ee.emit('app_data', data);
    ee.emit('render');
})

let routes = (
    <Route>
        <Route handler={HomePage} path="/" />
        <Route handler={HomePage} path="/home" />

        // noop routes
        <Route path="/login" />
        <Route path="/register" />
        <Route path="/upload" />
    </Route>
);
let router = Router.create({
    routes: routes, 
    location: Router.HistoryLocation
}); 
router.run((Root) => { render_app(Root); });

let emit_push_state = (path) => {
    return ee.emit('push_state:' + path);
}

var last_page = '/home';
const opened_modal = 1;
const rendered_page = 2;
let path_change = (path) => {
    if (emit_push_state(path))
        return opened_modal;
    last_page = path;
    try {
        ee.emit('close_open_modal');
        router.refresh();
    } catch (ex) {
        console.error(ex);
    }
    return rendered_page;
}

ee.addListener('modal_close', (modal) => {
    history.pushState({}, '', last_page);
    path_change(last_page);
});   

var no_push_state = [
    '/logout'
];

document.body.addEventListener('click', (e) => {
    // Bubble up the chain to check for a link
    var link = e.target;
    while (!link.pathname && link.parentNode)
        link = link.parentNode;

    // If there is a link, prevent the page change
    if (link.pathname) {
        e.preventDefault();
        if (link.href === '#')
            return;
        if (no_push_state.indexOf(link.pathname) == -1) {
            history.pushState({}, '', link.pathname);
        }
        path_change(link.pathname);
    }
});

window.onpopstate = function() {
    path_change(document.location.pathname);
    
}
if (emit_push_state(document.location.pathname)) {
    render_app(HomePage);
}

ee.addListener('push_state:/logout', () => {
    xhttp({
        url: '/logout',
        method: 'post',
        headers: {
            'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then((data) => {
        ee.emit('update_app_data', data);
    })
});

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