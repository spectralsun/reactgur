import React from 'react';
import FormComponent from './../components/FormComponent.js';


export default class RegistrationForm extends FormComponent 
{
    constructor(props) {
        super(props)
        this.url = '/api/v1/register';
        this.request_email = false;
        this.request_token = false;
        this.open_registration = [
            {name:'email', label:'Email Address', placeholder: 'Enter email address'},
            {name:'username', label:'Username', placeholder: 'Enter username'},
            {name:'password', type:'password', label:'Password', placeholder: 'Enter password'},
            {name:'confirm', type:'password', label:'Repeat Password', placeholder: 'Repeat password'}
        ]
        if (APP_CONF.request_registration) 
            this.open_registration[0].disabled = true;
        
        this.closed_registration = [
            {name:'email', label:'Email Address', placeholder: 'Enter email address'}
        ]
    }

    componentDidMount() {
        if (APP_CONF.request_registration && this.request_email) 
            React.findDOMNode(this.refs.email).lastChild.value = this.request_email;
        super.componentDidMount()
    }

    getFormData() {
        var data = super.getFormData();
        if (APP_CONF.request_registration && this.request_token)
            data['token'] = this.request_token;
        return data;
    }

    handleFail(data) {
        if (data && data['token'])
            data['email'] = [].concat(data['token'], data['email'] || []);
        super.handleFail(data);
    }

    render() {
        this.fields = this.open_registration;
        if (APP_CONF.request_registration) {
            var params = window.location.search.slice(1).split('&');
            var token = false;
            var email = false;
            for (var i = 0; i < params.length; i++) {
                var pair = params[i].split('=');
                if (decodeURIComponent(pair[0]) === 'token') 
                    token = decodeURIComponent(pair[1]);
                else if (decodeURIComponent(pair[0]) === 'email')
                    email = decodeURIComponent(pair[1]);
            }
            if (!token || !email)
                this.fields = this.closed_registration;
            this.request_email = email;
            this.request_token = token;
        }
        return (
            <div>
               {APP_CONF.request_registration ? (
                    <p>
                        Administrator approval is required before an account can be created. Submit your email and you will
                        receive an email with a link to register when your request has been approved.
                    </p>
                ) : null}
                {super.render()} 
            </div>
        )
    }
}