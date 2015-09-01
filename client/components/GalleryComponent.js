import React from 'react';
import xhttp from 'xhttp';

import ee from '../Emitter.js';
import Scroll from '../Scroll.js';

export default class MediaComponent extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {images: []}
        ee.addListener('page_wrapper', this.handlePageWrapper.bind(this));
        ee.addListener('resize', this.handleWindowResize.bind(this));
        ee.addListener('wrapper_scroll', this.handleScroll.bind(this));
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
        this.appendMedia ? this.iso.appended(new_media) : this.iso.prepended(new_media);
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

    errorMoreImages(data) {
        this.loadLock = false;
    }

    handleLayoutComplete() {
        if (this.scrollTo) {
            var item = this.scrollTo.item;
            var height = item.getBoundingClientRect().height;
            var marginTop = parseInt(item.style.marginTop);
            var topPos = parseInt(item.style.top)
            var scrollPos = topPos - ((window.innerHeight - (height + (marginTop * 2))) / 2) + 42;
            if (this.scrollTo.img.height == this.max_height) 
                scrollPos = topPos + marginTop - 4;
            this.scroll.scrollToPos(scrollPos); 
            this.scrollTo = false;
        }
    }

    handleImageClick(e) {
        var clicked = {
            id: e.currentTarget.parentNode.dataset.id,
            item: e.currentTarget.parentNode,
            link: e.currentTarget,
            img: e.target
        }
        if (this.expanded) {
            this.expanded.img.src = this.expanded.link.dataset.thumbnail;
            this.expanded.item.style.marginLeft = '4px';
            this.expanded.item.style.marginTop = '4px';
            if (this.expanded.id === clicked.id) {
                this.scrollTo = this.expanded;
                this.shrunkTo = this.expanded.img.src;
                this.expanded = null;
                return;
            }
        }
        this.expanded = clicked;
        clicked.img.src = clicked.link.dataset.href;
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
    
    handleMoreImages(data) {
        this.appendMedia = true;
        this.setState({images: this.state.images.concat(data)});
        this.loadLock = false;
    }

    handlePageWrapper(page_wrapper) {
        this.page_wrapper = page_wrapper;
        this.scroll = new Scroll(page_wrapper.getDOMNode());
    }

    handleScroll(e, page_wrapper) {
        var container = this.refs.isoContainer.getDOMNode();
        var height = container.getBoundingClientRect().height + 81;
        if (this.scroll.position() == height - window.innerHeight) {
            this.loadMore();
        }
    }

    handleWindowResize() {
        this.setMaxSize();
        this.updateImgStyles();
    }

    loadMore() {
        if (this.loadLock)
            return;
        this.loadLock = true;
        xhttp({
            url: '/api/v1/media',
            method: 'get',
            headers: { 'X-CSRFToken': this.csrfToken },
            params: { after: this.state.images[this.state.images.length - 1].href }
        })
        .then(this.handleMoreImages.bind(this))
        .catch(this.errorMoreImages.bind(this));
    }

    prependMedia(media) {
        this.setState({images: [].concat(media, this.state.images)});
    }

    setItemMargin() {
        var item = this.expanded.item;
        var img = this.expanded.img;
        var width = img.width + 16;
        var height = img.height + 16;

        if (img.width == this.max_width) {
            item.style.marginLeft = '4px';
        } else {
            item.style.marginLeft = Math.floor((((Math.ceil(width / 198) * 198) - width) / 2)) + 'px';
        } 
        item.style.marginTop = (Math.floor((((Math.ceil(height / 198) * 198) - height) / 2)) + 4) + 'px';
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
            items[x].firstChild.firstChild.style.maxHeight = this.max_height + 'px';
            items[x].firstChild.firstChild.style.maxWidth = this.max_width + 'px';
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
                 className="media-item well">
                <a className="image ignore" 
                   href="#"
                   data-title={image.name} 
                   data-thumbnail={image.thumbnail.href} 
                   data-href={image.href}  
                   onClick={this.handleImageClick.bind(this)}>
                    <img src={image.thumbnail.href} 
                         style={this.image_style}
                         onLoad={this.handleImageLoad.bind(this)}  />
                </a>
            </div>
        );
    }

    render() {
        return this.state.images.length == 0 ? (
            <div className="jumbotron text-center">
                <h1 className="text-center">{"There's no images here!"}</h1>
                <p>Upload some images!</p>
                <p>
                    <a href="/upload" className="btn btn-success btn-lg" >
                        <span className="glyphicon glyphicon-cloud-upload"></span>
                        <span> Upload Images</span>
                    </a>
                </p>
            </div> 
        ) : (
            <div ref="isoContainer" 
                 className="panel media-component text-center"
                 onScroll={this.handleScroll.bind(this)}>
                {this.state.images.map(this.renderImage.bind(this))}
            </div>
        );
    }
}
