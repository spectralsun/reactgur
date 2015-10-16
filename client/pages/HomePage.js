import React from 'react';

import GalleryComponent from '../components/GalleryComponent.js';
import ee from './../Emitter.js';

export default class HomePage extends React.Component 
{  
    constructor(props) {
        super(props);
    } 

    componentDidMount() {
        this.refs.galleryComponent.setState({images: IMAGES});
    }

    render() {
        return (
            <GalleryComponent user={this.props.user}
                              ref='galleryComponent' />
        )
    }
}