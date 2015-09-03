import React from 'react';
import {Input, Alert} from 'react-bootstrap';
import xhttp from 'xhttp';
import EventEmitter from 'events';

export default class FormComponent extends React.Component 
{
    constructor(props) {
        super(props)
        this.state = { errors: null };
        this.ee = new EventEmitter();
    }

    componentDidMount() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    }

    checkErrorAlert(name) {
        return this.state.errors && this.state.errors[name] ? (
            <Alert bsStyle='danger'>{this.state.errors[name]}</Alert>
        ) : null;
    }
    
    getFormData() {
        var data = {};
        for(var x = 0; x < this.fields.length; x++) {
            var field = this.fields[x];
            if (!field.node || field.node === 'input') {
                var node = this.refs[field.name].getInputDOMNode();
                data[field.name] = node.value
            }
        }
        return data;
    }

    handleSuccess(data) { this.ee.emit('success', data); }

    handleFail(data) {
        if (data) 
            this.setState({ errors: data });
        this.ee.emit('fail', data);
    }

    handleKeyDown(e) {
        if (e.keyCode == 13)
            this.submit();
    } 

    submit() {
        this.setState({ errors: null });
        var data = this.getFormData();

        xhttp({
            url: this.url,
            method: 'post',
            headers: { 'X-CSRFToken': this.csrfToken },
            data: data
        })
        .then(this.handleSuccess.bind(this))
        .catch(this.handleFail.bind(this));
    }

    render() {
        var fields = [];
        for(var x = 0; x < this.fields.length; x++) {
            var field = this.fields[x];
            if (!field.node || field.node === 'input') {
                var type = field.type || 'text';
                fields.push(
                    <div>
                        <Input type={type} 
                               placeholder={field.placeholder} 
                               label={field.label} 
                               name={field.name} 
                               ref={field.name}
                               disabled={!!field.disabled} 
                               onKeyDown={this.handleKeyDown.bind(this)} />
                        {this.checkErrorAlert(field.name)}
                    </div>
                );
            }
        }
        return (<div>{fields}</div>);
    }
} 