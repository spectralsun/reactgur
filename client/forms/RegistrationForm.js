import React from 'react';
import FormComponent from './../components/FormComponent.js';


export default class RegistrationForm extends FormComponent 
{
    constructor(props) {
        super(props)
        this.open_registration = [
            {name:'email', label:'Email Address', placeholder: 'Enter email address'},
            {name:'username', label:'Username', placeholder: 'Enter username'},
            {name:'password', type:'password', label:'Password', placeholder: 'Enter password'},
            {name:'confirm', type:'password', label:'Repeat Password', placeholder: 'Repeat password'}
        ]
        this.closed_registration = [
            {name:'email', label:'Email Address', placeholder: 'Enter email address'}
        ]
    }

    render() {
        this.fields = APP_CONF.request_registration ? this.closed_registration : this.open_registration;
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