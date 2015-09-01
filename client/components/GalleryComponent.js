import React from 'react';
import {Input} from 'react-bootstrap';
import xhttp from 'xhttp';

import ConfirmModal from './../modals/ConfirmModal.js';

import ee from '../Emitter.js';
import Scroll from '../Scroll.js';

export default class MediaComponent extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {images: [], user: APP_DATA.username, is_admin: APP_DATA.is_admin}
        ee.addListener('page_wrapper', this.handlePageWrapper.bind(this));
        ee.addListener('resize', this.handleWindowResize.bind(this));
        ee.addListener('wrapper_scroll', this.handleScroll.bind(this));
        ee.addListener('app_data', this.handleAppData.bind(this));
    }

    componentWillMount() {
        this.setMaxSize(); 
    }

    componentDidMount() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        this.createIsoContainer();      
    }

    componentDidUpdate() {
        this.createIsoContainer();
        var new_media = [];
        var items = this.refs.isoContainer.getDOMNode().children;
        for (var x = 0; x < items.length; x++) {
            if (items[x].style.top === "")
                new_media.push(items[x]);
        }
        this.appendMedia && new_media.length > 0 ? this.iso.appended(new_media) : this.iso.prepended(new_media);
        if (new_media.length == 0)
            this.iso.layout();
        this.appendMedia = false;
    }

    createIsoContainer() {
        if (this.iso || !this.refs.isoContainer)
            return;
        this.iso = new Isotope(this.refs.isoContainer.getDOMNode(), {
           layoutMode: 'packery',
           packery: {
            gutter: 4,
            columnWidth: 194,
            rowHeight: 194
           }
        });
        this.iso.on('layoutComplete', this.handleLayoutComplete.bind(this));
        this.iso.layout(); 
    }

    handleAppData(data) {
        this.setState({user: data.username, is_admin: data.is_admin});
    }

    handleDeleteClick(e) {
        var node = e.target;
        while (node.className.indexOf('media-item') === -1)
            node = node.parentNode;
        this.deleteMediaId = node.dataset.id;
        this.deleteMediaNode = node;
        this.refs.confirmModal.setState({
            message: 'Are you sure you wish to delete this image?',
            title: 'Confirm Delete Image',
            confirm: 'Delete Image',
            cancel: 'Cancel'
        })
        this.refs.confirmModal.open(this.handleDeleteConfirm.bind(this));
    }

    handleDeleteConfirm(confirmed) {
        if (!confirmed) return;
        xhttp({
            url: '/api/v1/media',
            method: 'delete',
            headers: { 'X-CSRFToken': this.csrfToken },
            data: {id: this.deleteMediaId}
        })
        .then(this.handleDeleteSuccess.bind(this))
        .catch(this.handleDeleteError.bind(this))
    }

    handleDeleteError() {

    }

    handleDeleteSuccess() {
        this.iso.remove(this.deleteMediaNode);
        var images = this.state.images.slice(0);
        for (var x = 0; x < images.length; x++) 
            if (images[x].href === this.deleteMediaId) {
                images.splice(x, 1);
                return this.setState({ images: images });
            }
    }

    handleLayoutComplete() {
        if (this.scrollTo) {
            var height = this.scrollTo.item.getBoundingClientRect().height;
            var marginTop = parseInt(this.scrollTo.img.style.marginTop);
            var topPos = parseInt(this.scrollTo.item.style.top)
            var scrollPos = topPos - ((window.innerHeight - (height + (marginTop * 2))) / 2) + 42;
            if (this.scrollTo.img.height == this.max_height) 
                scrollPos = topPos + marginTop - 4;
            this.scroll.scrollToPos(scrollPos); 
            this.scrollTo = false;
        }
    } 

    handleLoadError(data) {
        this.loadLock = false;
    }
    
    handleLoadSuccess(data) {
        this.appendMedia = true;
        this.setState({images: this.state.images.concat(data)});
        this.loadLock = false;
    }

    handleItemClick(e) {
        var node = e.target;
        var overlay = null;
        var item = null;
        while (!item) {
            if (node.className.indexOf('media-overlay') !== -1)
                overlay = node;
            if (node.className.indexOf('media-item') !== -1)
                item = node;
            node = node.parentNode;
        }
        if (overlay && (item.className.indexOf('expanded') !== -1 ||
                        overlay.className.indexOf('media-overlay-top') !== -1)) 
            return; 
        var clicked = {
            id: item.dataset.id,
            item: item,
            img: item.firstChild
        }
        if (this.expanded) {
            this.expanded.item.className = 'media-item well';
            this.expanded.img.src = this.expanded.item.dataset.thumbnail;
            this.expanded.img.style.marginLeft = '0px';
            this.expanded.img.style.marginRight = '0px';
            this.expanded.img.style.marginTop = '0px';
            this.expanded.img.style.marginBottom = '0px';
            if (this.expanded.id === clicked.id) {
                this.scrollTo = this.expanded;
                this.shrunkTo = this.expanded.img.src;
                this.expanded = null;
                return;
            }
        }
        this.expanded = clicked;
        clicked.item.className = 'media-item well expanded';
        clicked.img.src = clicked.item.dataset.href;
        this.scrollTo = clicked;
    }

    handleImageLoad(e) {
        if (this.expanded) 
            this.setItemMargin();
        if (this.expanded || this.shrunkTo) {
            this.shrunkTo = null;
            this.iso.layout();
        }
    }

    handlePageWrapper(page_wrapper) {
        this.page_wrapper = page_wrapper;
        this.scroll = new Scroll(page_wrapper.getDOMNode());
    }

    handleScroll(e, page_wrapper) {
        var container = this.refs.isoContainer.getDOMNode();
        var height = container.getBoundingClientRect().height + 81;
        if (this.scroll.position() == height - window.innerHeight) {
            this.fetchMedia();
        }
    }

    handleWindowResize() {
        this.setMaxSize();
        this.updateImgStyles();
    }

    fetchMedia() {
        if (this.loadLock)
            return;
        this.loadLock = true;
        xhttp({
            url: '/api/v1/media',
            method: 'get',
            headers: { 'X-CSRFToken': this.csrfToken },
            params: { after: this.state.images[this.state.images.length - 1].href }
        })
        .then(this.handleLoadSuccess.bind(this))
        .catch(this.handleLoadError.bind(this));
    }

    prependMedia(media) {
        this.setState({images: [].concat(media, this.state.images)});
    }

    setItemMargin() {
        var item = this.expanded.item;
        var img = this.expanded.img;
        var width = img.width + 16;
        var height = img.height + 16;
        if (img.width < 380 && img.height < 380) {
            img.style.marginTop = ((380 - img.height) / 2) + 'px'
            return;
        }
        if (img.width >= 380) {
            if (img.width == this.max_width) {
                img.style.marginLeft = '0px';
                img.style.marginRight = '0px';
            } else {
                var left_right =  Math.floor((((Math.ceil(width / 197.5) * 197.5) - width) / 2)) + 'px'
                img.style.marginLeft = left_right;
                img.style.marginRight = left_right;
            } 
        }
        var top_bottom = Math.floor((((Math.ceil(height / 197.5) * 197.5) - height) / 2))  + 'px'
        img.style.marginTop = top_bottom;
        img.style.marginBottom = top_bottom;
    }

    setMaxSize() {
        this.max_width = 973;
        this.max_height = window.innerHeight - 92;
        this.image_style = {
            maxWidth: this.max_width,
            maxHeight: this.max_height
        }
    }

    updateImgStyles() { 
        var items = this.refs.isoContainer.getDOMNode().children;
        var image_style = {
            maxWidth: this.max_width,
            maxHeight: this.max_height
        }
        for (var x = 0; x < items.length; x++) {
            items[x].firstChild.style.maxHeight = this.max_height + 'px';
            items[x].firstChild.style.maxWidth = this.max_width + 'px';
        }
        if (this.expanded) {
            this.setItemMargin();
        }
        this.iso.layout();
    }

    renderImage(image) {
        return (
            <div data-id={image.href} 
                 key={image.href} 
                 className="media-item image well"
                 data-title={image.name} 
                 data-thumbnail={image.thumbnail.href} 
                 data-href={image.href} 
                 onClick={this.handleItemClick.bind(this)}>
                <img src={image.thumbnail.href} 
                         style={this.image_style}
                         onLoad={this.handleImageLoad.bind(this)} />
                <div className='media-overlay media-overlay-bottom'>
                    <div className='media-overlay-wrapper'>
                        <div className='media-overlay-content'>
                            <span className='media-name'>{image.name}</span>
                        </div>
                        <div className='media-links-button'>
                            <span className='glyphicon glyphicon-link'></span>
                            <span className='glyphicon glyphicon-triangle-top'></span>
                            
                            <div className='media-links-menu text-left'>
                                <div className='media-overlay-wrapper'>
                                    <Input type='text' value={APP_CONF.external_url + image.href} label='Direct Link' />
                                </div>
                                <div className='media-overlay-background'></div>
                            </div>
                        </div>
                        
                    </div>
                    <div className='media-overlay-background'></div>
                </div>
                {this.state.user && (this.state.user === image.user || this.state.is_admin) ? (
                    <div className='media-overlay media-overlay-top'>
                        <div className='media-delete-button media-api-button'
                             onClick={this.handleDeleteClick.bind(this)}>
                            <span className='glyphicon glyphicon-remove'></span>
                            <div className='media-overlay-background'></div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    render() {
        return this.state.images.length == 0 ? (
            <div className="jumbotron text-center">
                <h1 className="text-center">{"There's no images here!"}</h1>
                <p>Upload some images!</p>
                <p>
                    <a href="/upload" className="btn btn-success btn-lg">
                        <span className="glyphicon glyphicon-cloud-upload"></span>
                        <span> Upload Images</span>
                    </a>
                </p>
            </div> 
        ) : (
            <div>
                <div ref="isoContainer" 
                     className="panel media-component text-center"
                     onScroll={this.handleScroll.bind(this)}>
                    {this.state.images.map(this.renderImage.bind(this))}
                </div>
                <ConfirmModal ref='confirmModal' />
            </div>
        );
    }
}
