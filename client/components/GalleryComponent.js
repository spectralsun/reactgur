import React from 'react';

import ee from '../Emitter.js';
import scrollToPos from '../scrollToPos.js';

export default class MediaComponent extends React.Component 
{
    constructor(props) {
        super(props);
        this.img = [];
    }

    componentWillMount() {
        this.setMaxSize(); 
    }

    componentDidMount() {
        if (this.iso)
            return;

        // create masonry for specified container
        this.iso = new Isotope(this.refs.isoContainer.getDOMNode(), {
           layoutMode: 'packery',
           packery: {
            gutter: 4,
            columnWidth: 194,
            rowHeight: 194
           }
        });

        this.iso.on('layoutComplete', this.onLayoutComplete.bind(this));

        // focus the container
        this.refs.isoContainer.getDOMNode().focus();

        // relayout after reloading items
        this.iso.layout();

        ee.addListener('resize', this.onWindowResize.bind(this));
    }

    componentDidUpdate() {
        // reload all items in container (bad for performance - should find a way to append/prepend by disabling react render)
        this.iso.reloadItems();

        // relayout after reloading items
        this.iso.layout();

        // force resize event
        setTimeout(function() {
            window.dispatchEvent(new Event('resize'));
        }, 1);
    }

    onLayoutComplete() {
        if (this.scrollTo) {
            var item = this.scrollTo.item;
            var height = item.getBoundingClientRect().height;
            var marginTop = parseInt(item.style.marginTop);
            var topPos = parseInt(item.style.top)
            var scrollPos = topPos - ((window.innerHeight - (height + (marginTop * 2))) / 2) + 42;
            if (this.scrollTo.img.height == this.max_height) 
                scrollPos = topPos + marginTop - 4;
            scrollToPos(scrollPos); 
            this.scrollTo = false;
        }
    }

    onImageClick(e) {
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
                this.expanded = null;
                return;
            }
        }
        this.expanded = clicked;
        clicked.img.src = clicked.link.dataset.href;
        this.scrollTo = clicked;
    }

    onImageLoad() {
        if (this.expanded) {
            this.setItemMargin();
        }
        this.iso.layout();
    }

    onWindowResize() {
        this.setMaxSize();
        this.updateImgStyles();
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

    setScrollPos() {
        var item = this.expanded.item;
        var height = item.getBoundingClientRect().height;
        var marginTop = parseInt(item.style.marginTop);
        var topPos = parseInt(item.style.top)
        var scrollPos = topPos - ((window.innerHeight - (height + (marginTop * 2))) / 2) + 42;
        if (this.expanded.img.height == this.max_height) 
            scrollPos = topPos + marginTop - 4;
        scrollToPos(scrollPos);
    }

    updateImgStyles() {
         var image_style = {
            maxWidth: this.max_width,
            maxHeight: this.max_height
        }
        for (var x = 0; x < this.img.length; x++) {
            this.img[x].getDOMNode().style.maxHeight = this.max_height + 'px';
            this.img[x].getDOMNode().style.maxWidth = this.max_width + 'px';
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
                   onClick={this.onImageClick.bind(this)}>
                    <img src={image.thumbnail.href} 
                         style={this.image_style}
                         ref={(i) => this.img.push(i)}
                         onLoad={this.onImageLoad.bind(this)}  />
                </a>
            </div>
        );
    }

    render() {
        return this.props.images.length == 0 ? (
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
            <div ref="isoContainer" className="panel media-component text-center">
                {this.props.images.map(this.renderImage.bind(this))}
            </div>
        );
    }
}
