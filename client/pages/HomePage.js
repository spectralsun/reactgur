import React from 'react';

import GalleryComponent from '../components/GalleryComponent.js';


export default class HomePage extends React.Component 
{   
    componentDidMount() {
        this.refs.galleryComponent.setState({images: window.IMAGES})
    } 
    render() {
        return (
            <GalleryComponent ref='galleryComponent' />
        )
    }
}