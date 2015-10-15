import React from 'react';
import xhttp from 'xhttp';
import {Input, DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';


export default class MediaComponent extends React.Component
{
    componentDidMount() {
        var dropdownNode = React.findDOMNode(this.refs.dropdownButton);
        dropdownNode.addEventListener('click', this.handleDropdownClick.bind(this));
        dropdownNode.addEventListener('contextmenu', this.handleDropdownClick.bind(this));
    }

    handleDeleteClick(e) {
        var node = e.target;
        while (node.className.indexOf('media-item') === -1)
            node = node.parentNode;
        this.mediaNode = node;
        reactgur.refs.confirmModal.setState({
            message: 'Are you sure you wish to delete this image?',
            title: 'Confirm Delete Image',
            confirm: 'Delete Image',
            cancel: 'Cancel'
        })
        reactgur.refs.confirmModal.open(this.handleDeleteConfirm.bind(this));
    }

    handleDeleteConfirm(confirmed) {
        if (!confirmed) return;
        xhttp({
            url: '/api/v1/media',
            method: 'delete',
            headers: { 'X-CSRFToken': this.csrfToken },
            data: { id: this.props.image.href }
        })
        .then(this.handleDeleteSuccess.bind(this))
        .catch(this.handleDeleteError.bind(this))
    }

    handleDeleteSuccess() {
        if (this.props.onDelete)
            this.props.onDelete(this.mediaNode);
        reactgur.addNotification({
            title: 'Deleted Image',
            message: '"' + this.props.image.name + '" was deleted successfully.',
            level: 'success',
            position: 'br'
        });
    }

    handleDeleteError() {
        reactgur.addNotification({
            title: 'Failed to Delete Image',
            message: 'Could not delete "' + this.props.image.name + '".',
            level: 'error',
            position: 'br'
        });
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
            <div
             key={this.props.image.href}
             className="media-item image well"
             data-id={this.props.image.href}
             data-created={new Date(this.props.image.created_at).getTime()}
             data-title={this.props.image.name}
             data-height={this.props.image.height}
             data-width={this.props.image.width}
             data-thumbnail={this.props.image.thumbnail.href}
             data-href={this.props.image.href}
             onClick={this.props.onClick}>
                <img
                 src={this.props.image.thumbnail.href}
                 onLoad={this.props.onImageLoad} />
                <div className='media-overlay media-overlay-bottom'>
                    <div className='media-overlay-wrapper'>
                        <div className='media-overlay-content'>
                            <span className='media-name'>{this.props.image.name}</span>
                        </div>
                        <DropdownButton
                         className='media-links-button'
                         noCaret
                         title={(
                            <span>
                                <Glyphicon glyph='link' />
                                <Glyphicon glyph='triangle-top' />
                            </span>
                         )}
                         ref="dropdownButton">
                            <MenuItem className='media-links-menu text-left' disabled>
                                <div className='media-overlay-wrapper'>
                                    <Input
                                     type='text'
                                     value={APP_CONF.external_url + this.props.image.href}
                                     label='Direct Link'
                                     readOnly
                                     onClick={(e) => e.target.select()}/>
                                </div>
                                <div className='media-overlay-background'></div>
                            </MenuItem>
                        </DropdownButton>
                    </div>
                    <div className='media-overlay-background'></div>
                </div>
                <div className='media-overlay media-overlay-top'>
                    {(this.props.user.username === this.props.image.user || this.props.user.is_admin) ? (
                        <div
                         className='media-delete-button media-api-button'
                         onClick={this.handleDeleteClick.bind(this)}>
                            <Glyphicon glyph='trash' />
                            <div className='media-overlay-background'></div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}