import React from 'react';

import GalleryComponent from '../components/GalleryComponent.js';
import ee from './../Emitter.js';

export default class HomePage extends React.Component 
{  
    constructor(props) {
        super(props);
        ee.addListener('media_uploaded', this.handleMediaUploaded.bind(this));
    } 

    componentDidMount() {
        this.refs.galleryComponent.setState({images: IMAGES});
    }

    handleMediaUploaded(media) {
        this.refs.galleryComponent.prependMedia(media)
    } 
    
    render() {
        return (
            <GalleryComponent user={this.props.user}
                              ref='galleryComponent' />
        )
    }
}