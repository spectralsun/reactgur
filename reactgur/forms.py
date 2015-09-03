from wtforms import validators, HiddenField, PasswordField, StringField, \
    TextField, BooleanField, ValidationError
from wtforms.fields.html5 import EmailField
from wtforms.widgets import TextArea
from flask_wtf import Form

from reactgur.models import User, UserRegistrationRequest

class RegistrationRequestForm(Form):
    email = EmailField('Email Address', [validators.DataRequired(), validators.Email()])
    
class RegistrationForm(Form):
    username = TextField('Username', [validators.Length(min=4, max=25)])
    email = EmailField('Email Address', [validators.DataRequired(), validators.Email()])
    password = PasswordField('New Password', [
        validators.Required(),
        validators.Length(min=8),
        validators.EqualTo('confirm', message='Passwords must match')
    ])
    confirm = PasswordField('Repeat Password')

    def validate_username(form, field):
        if User.get_user_by_username(field.data):
            raise ValidationError('Username already registered.');

    def validate_email(form, field):
        if User.get_user_by_email(field.data):
            raise ValidationError('Email already registered.')

class TokenRegistrationForm(RegistrationForm):
    token = TextField('token', [validators.DataRequired()])
    def validate_token(form, field):
        if not UserRegistrationRequest.get_request(form.email.data, field.data):
            raise ValidationError('Invalid token and/or email.')

class LoginForm(Form):
    username = TextField('Username', validators=[validators.DataRequired()])
    password = TextField('Password', validators=[validators.DataRequired()])