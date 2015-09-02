import React from 'react';
import {Input, DropdownButton, MenuItem} from 'react-bootstrap';


export default class MediaComponent extends React.Component
{
    componentDidMount() {
        var dropdownNode = React.findDOMNode(this.refs.dropdownButton);
        dropdownNode.addEventListener('click', this.handleDropdownClick.bind(this));
        dropdownNode.addEventListener('contextmenu', this.handleDropdownClick.bind(this));
    }

    handleDropdownClick(e) {
       var node = e.target;
       while (node.className.indexOf('btn-group') == -1) {
           if (node.className.indexOf('dropdown-menu') !== -1) {
               return;
           }
           node = node.parentNode;
       }
       node.parentNode.className.indexOf('open-link-menu') >= 0 ?
           node.parentNode.classList.remove('open-link-menu') :
           node.parentNode.classList.add('open-link-menu');

    }

    render() {
        return (
            <div data-id={this.props.image.href} 
                 key={this.props.image.href} 
                 className="media-item image well"
                 data-title={this.props.image.name}
                 data-height={this.props.image.height}
                 data-width={this.props.image.width} 
                 data-thumbnail={this.props.image.thumbnail.href} 
                 data-href={this.props.image.href} 
                 onClick={this.props.onClick}>
                <img src={this.props.image.thumbnail.href} 
                     onLoad={this.props.onImageLoad} />
                <div className='media-overlay media-overlay-bottom'>
                    <div className='media-overlay-wrapper'>
                        <div className='media-overlay-content'>
                            <span className='media-name'>{this.props.image.name}</span>
                        </div>
                        <DropdownButton className='media-links-button' 
                                        noCaret
                                        title={(<span>
                                                    <span className='glyphicon glyphicon-link'></span>
                                                    <span className='glyphicon glyphicon-triangle-top'></span>
                                                </span>)}
                                        ref="dropdownButton">
                            <MenuItem className='media-links-menu text-left' disabled>
                                <div className='media-overlay-wrapper'>
                                    <Input type='text' value={APP_CONF.external_url + this.props.image.href} label='Direct Link' readOnly onClick={(e) => e.target.select()}/>
                                </div>
                                <div className='media-overlay-background'></div>
                            </MenuItem>
                        </DropdownButton>
                    </div>
                    <div className='media-overlay-background'></div>
                </div>
                {this.props.currentUser && (this.props.currentUser === this.props.image.user || this.props.currentUserIsAdmin) ? (
                    <div className='media-overlay media-overlay-top'>
                        <div className='media-delete-button media-api-button'
                             onClick={this.props.onDeleteClick}>
                            <span className='glyphicon glyphicon-remove'></span>
                            <div className='media-overlay-background'></div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}