import React from 'react';
import xhttp from 'xhttp';

import ConfirmModal from './../modals/ConfirmModal.js';

import MediaComponent from './../components/MediaComponent.js';

import ee from '../Emitter.js';
import Scroll from '../Scroll.js';

export default class GalleryComponent extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {images: []}
        this.columns = 5;
        ee.addListener('resize', this.handleWindowResize.bind(this));
        ee.addListener('wrapper_scroll', this.handleScroll.bind(this));
    }

    componentWillMount() {
        this.calculateMaxSize(); 
    }

    componentDidMount() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        this.page_wrapper = React.findDOMNode(this.refs.mainContainer).parentNode;
        this.scroll = new Scroll(page_wrapper);
        this.createIsoContainer();      
    }

    componentDidUpdate() {
        this.createIsoContainer();
        if (!this.refs.isoContainer)
            return;
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

    calculateExpandedPosition() {
        var item_column = ((parseInt(this.expanded.item.style.left) - 74) + 198) / 198;
        if (item_column >= (this.columns - 2)) {
            var offset = 0;
            if (item_column < this.columns) {
                offset = this.columns - item_column;
                while ((this.expanded_width + (this.expanded_margin_lr * 2) + 18) > (198 * (this.columns - offset))) {
                    offset --;
                }
            }
            this.expanded.item.style.right = (74 + (198 * (offset))) + 'px';
            this.expanded.item.style.left = '';
        } 
    }

    calculateExpandedSize() {
        if (!this.expanded) return;
        var img = this.expanded.img;
        var item = this.expanded.item;
        var width = parseInt(item.dataset.width); 
        var height = parseInt(item.dataset.height);
        if (width > this.max_width) {
            height = (this.max_width * height)/width;
            width = this.max_width;
        }
        if (height > this.max_height) {
            width = (this.max_height * width)/height;
            height = this.max_height;
        }
        var total_width = width + 18;
        var total_height = height + 18;
        var margin_lr = 0;
        var margin_tb = 0;
        if (width < 380 && height < 380) 
            margin_tb = ((380 - height) / 2); 
        else 
            margin_tb = Math.floor((((Math.ceil(total_height / 198) * 198) - total_height) / 2));
        
        if (item.dataset.width >= 380) 
            margin_lr = Math.floor((((Math.ceil(total_width / 198) * 198) - total_width) / 2));
        
        if (width == this.max_width) 
            margin_tb = 4;
        this.setExpandedSize(margin_tb, margin_lr, height, width)
        // Save for preparing expanded item position
        this.expanded_margin_lr = margin_lr;
        this.expanded_width = width;
    }

    calculateMaxSize() {
        this.mobile = false;
        this.columns = 5;
        if (window.innerWidth <= 1200)
            this.columns = 4;
        else if (window.innerWidth <= 992)
            this.columns = 3;
        else if (window.innerWidth <= 768)
             this.mobile = true;
        this.max_width = (this.columns * 192) + 4;
        this.max_height = window.innerHeight - 130;
    }

    createIsoContainer() {
        if (this.iso || !this.refs.isoContainer)
            return;
        this.iso = new Isotope(this.refs.isoContainer.getDOMNode(), {
           layoutMode: 'packery'
        });
        this.iso.on('layoutComplete', this.handleLayoutComplete.bind(this));
        this.iso.layout(); 
    }

    closeExpanded() {
        this.expanded.item.className = 'media-item well';
        this.expanded.img.src = this.expanded.item.dataset.thumbnail;
        this.setExpandedSize(0, 0, 180, 180);
        this.expanded.item.style.right = '';
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
        if (this.expanded) {
            this.expanded.item.style.right = '';
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
        var bottom_overlay = null;
        var item = null;
        while (!item) {
            if (node.className.indexOf('media-api-button') !== -1)
                return;
            if (node.className.indexOf('media-overlay-bottom') !== -1)
                bottom_overlay = node;
            if (node.className.indexOf('media-item') !== -1)
                item = node;
            node = node.parentNode;
        }
        if (bottom_overlay && item.className.indexOf('expanded') !== -1) 
            return; 
        
        if (this.expanded) {
            this.closeExpanded();
            if (this.expanded.id === item.dataset.id) {
                this.scrollTo = this.expanded;
                this.shrunkTo = this.expanded.img.src;
                this.expanded = null;
                return;
            }
        }
        this.expanded = this.scrollTo = {
            id: item.dataset.id,
            item: item,
            img: item.firstChild
        }
        this.expanded.item.className = 'media-item well expanded';
        this.expanded.img.src = this.expanded.item.dataset.href;
        this.calculateExpandedSize(); 
        this.calculateExpandedPosition(); 
        this.iso.layout();
    }

    handleImageLoad(e) {
        if (this.expanded || this.shrunkTo) {
            this.shrunkTo = null;
            this.iso.layout();
        }
    }

    handleScroll(e, page_wrapper) {
        var container = this.refs.isoContainer.getDOMNode();
        var height = container.getBoundingClientRect().height + 81;
        if (this.scroll.position() == height - window.innerHeight) {
            this.fetchMedia();
        }
    }

    handleWindowResize() {
        this.calculateMaxSize();
        this.calculateExpandedSize();
        this.iso.layout();
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

    setExpandedSize(margin_tb, margin_lr, height, width) {
        this.expanded.img.style.marginTop = margin_tb + 'px';
        this.expanded.img.style.marginBottom = margin_tb + 'px';
        this.expanded.img.style.marginLeft = margin_lr + 'px';
        this.expanded.img.style.marginRight = margin_lr + 'px';
        this.expanded.img.style.height = height + 'px';
        this.expanded.img.style.width = width + 'px';
    }

    render() {
        return this.state.images.length == 0 ? (
            <div ref="mainContainer" className="jumbotron text-center">
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
            <div ref="mainContainer">
                <div ref="isoContainer" 
                     className="panel media-component text-center"
                     onScroll={this.handleScroll.bind(this)}>
                    {this.state.images.map((image) => {
                        return (
                            <MediaComponent image={image}
                                            onClick={this.handleItemClick.bind(this)}
                                            onImageLoad={this.handleImageLoad.bind(this)} 
                                            onDeleteClick={this.handleDeleteClick.bind(this)}
                                            currentUser={this.props.user} />
                        );
                    })}
                </div>
                <ConfirmModal ref='confirmModal' />
            </div>
        );
    }
}
