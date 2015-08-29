import React from 'react';

import scrollToPos from '../scrollToPos.js';

export default class MediaComponent extends React.Component 
{
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

        window.onresize = this.onWindowResize.bind(this);
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
        if (this.scrollPos) {
            var item = this.expanded.link.parentNode;
            var height = item.getBoundingClientRect().height;
            var marginTop = parseInt(item.style.marginTop);
            var topPos = parseInt(item.style.top)
            var scrollPos = topPos - ((window.innerHeight - (height + (marginTop * 2))) / 2) + 42;
            if (this.expanded.img.height == this.max_height) 
                scrollPos = topPos + marginTop - 4;
            scrollToPos(scrollPos);
        }
    }

    onImageClick(e) {
        if (this.expanded) {
            this.expanded.img.src = this.expanded.link.dataset.thumbnail;
            this.expanded.link.parentNode.style.marginLeft = '4px';
            this.expanded.link.parentNode.style.marginTop = '4px';
        }
        this.expanded = {
            link: e.currentTarget,
            img: e.target
        }
        e.target.src = e.currentTarget.dataset.href;
        this.scrollPos = true;
    }

    setItemMargin() {
        var item = this.expanded.link.parentNode;
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

    setMaxSize() {
        this.max_width = 973;
        this.max_height = window.innerHeight - 92;
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

    imgRef(img) {
        this.img.push(img);
    }

    render() {
        var images = this.props.images;
        if (images.length == 0)
            return (
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
            )
        this.img = [];
        this.setMaxSize();
        var mediaItems = [];
        var image_style = {
            maxWidth: this.max_width,
            maxHeight: this.max_height
        }
        for(var x = 0; x < images.length; x++) {
            var image = images[x];
            var img = <img src={image.thumbnail.href} ref={this.imgRef.bind(this)} onLoad={this.onImageLoad.bind(this)} style={image_style} />;
            mediaItems.push(
                <div key={image.path} className="media-item well">
                    <a className="image ignore" data-title={image.name} data-thumbnail={image.thumbnail.href} data-href={image.href} href="#" onClick={this.onImageClick.bind(this)}>
                        {img}
                    </a>
                </div>
            );
        }
        console.log(mediaItems)
        return (
            <div ref="isoContainer" className="panel media-component text-center">
                {mediaItems}
            </div>
        );
    }
}
