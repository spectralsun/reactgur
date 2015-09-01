from flask import Blueprint, current_app
from flask.ext.login import LoginManager, login_user, logout_user, \
    current_user

from reactgur.forms import RegistrationForm, LoginForm, TokenRegistrationForm
from reactgur.models import User
from reactgur.util import jsonify


user_api = Blueprint('user_api', __name__)

login_manager = LoginManager()
@login_manager.user_loader
def load_user(userid):
    return User.get(userid)

@user_api.route('/api/v1/register', methods=['POST'])
def register():
    if current_app.config['REQUEST_REGISTRATION']:
        form = TokenRegistrationForm()
    else:
        form = RegistrationForm()
    if form.validate_on_submit():
        new_user = User(form.username.data, form.email.data, form.password.data)
        new_user.save()
        if login_user(new_user):
            return jsonify(authed=True, username=new_user.username)
        return jsonify(authed=False)
    form.errors['_status_code'] = 400 
    return jsonify(**form.errors)

@user_api.route('/api/v1/login', methods=['POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        form_user = User.get_user(form.username.data)
        if form_user and form_user.check_password(form.password.data):
            if login_user(form_user):
                return jsonify(authed=True, username=form_user.username)
            else:
                return jsonify(username=['Your account is currently disabled.'], 
                    _status_code=400)
        else:
            return jsonify(username=['Invalid username, email or password.'], 
                _status_code=400)
        return ''
    form.errors['_status_code'] = 400 
    return jsonify(**form.errors)

@user_api.route('/api/v1/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify(authed=False)
