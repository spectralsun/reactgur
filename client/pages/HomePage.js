import React from 'react';

import GalleryComponent from '../components/GalleryComponent.js';

import scrollToPos from '../scrollToPos.js';


export default class HomePage extends React.Component 
{    
    render() {
        return (
            <GalleryComponent images={window.IMAGES} />
        )
    }
}