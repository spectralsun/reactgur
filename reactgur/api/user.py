from flask import Blueprint, current_app, request, render_template, url_for
from flask.ext.login import LoginManager, login_user, logout_user, \
    current_user, login_required
from flask_mail import Message

from reactgur.forms import RegistrationForm, LoginForm, \
    TokenRegistrationForm, RegistrationRequestForm
from reactgur.mail import mail_session
from reactgur.models import User, UserRegistrationRequest
from reactgur.util import jsonify, api_alert_response


user_api = Blueprint('user_api', __name__)

anonymous_user_json = dict(username=None, is_admin=False)

login_manager = LoginManager()
@login_manager.user_loader
def load_user(userid):
    return User.get(userid)

def registration_request(email, ip):
    msg = Message(
        'Registration Request', 
        sender=current_app.config['MAIL_USERNAME'],
        recipients=current_app.config['REQUEST_REGISTRATION_EMAIL'])
    context = dict(
        request_email=email,
        request_ip=ip,
        approve_url=url_for(
            '.registration_request_action', 
            action='approve', 
            email=email,
            _external=True),
        deny_url=url_for(
            '.registration_request_action', 
            action='deny', 
            email=email,
            _external=True)
    )
    msg.body = render_template('email/registration_request.plain', **context)
    msg.html = render_template('email/registration_request.html', **context)
    registration_request = UserRegistrationRequest(email, ip)
    registration_request.save()
    mail_session.send(msg) 
    return jsonify(dict(request_received=True))

def reply_registration_request(registration_request, action='deny'):
    status = 'Denied' if action == 'deny' else 'Approved'
    context = dict(
        approved=action != 'deny', 
        app_name=current_app.config['APP_NAME']
    )
    msg = Message(
        'Registration Request ' + status, 
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[registration_request.email])
    if context['approved']:
        if registration_request.granted:
            return api_alert_response(
                '%s already been approved' % registration_request.email,
                400,
                'danger')
        context['register_link'] = url_for(
            'index', 
            filename='/register', 
            token=registration_request.token,
            email=registration_request.email,
            _external=True)
        registration_request.granted = True
        registration_request.save()
    else:
        registration_request.delete()
    msg.body = render_template('email/registration_response.plain', **context)
    msg.html = render_template('email/registration_response.html', **context)
    mail_session.send(msg)
    return api_alert_response('%s has been %s.' %  
        (registration_request.email, status))

@user_api.route('/api/v1/register', methods=['POST'])
def register():
    form = RegistrationForm()
    if current_app.config['REQUEST_REGISTRATION']:
        if 'token' in request.json:
            form = TokenRegistrationForm()
        else:
            form = RegistrationRequestForm()
            if form.validate_on_submit():
                return registration_request(form.email.data, 
                                            request.remote_addr)
    if form.validate_on_submit():
        new_user = User(form.username.data, 
                        form.email.data, 
                        form.password.data,
                        request.remote_addr)
        new_user.save()
        if login_user(new_user):
            return jsonify(authed=True, 
                           username=new_user.username,
                           is_admin=new_user.is_admin)
        return jsonify(authed=False)
    form.errors['_status_code'] = 400 
    return jsonify(**form.errors)

@user_api.route('/api/v1/registration_request/<action>')
def registration_request_action(action='deny'):
    if not current_user.is_authenticated() or not current_user.is_admin:
        return api_alert_response('Access Denied.', 400, 'danger')
    if action not in ['approve', 'deny']:
        return api_alert_response('Invalid action.', 400, 'danger')
    email = request.args['email']
    registration_request = UserRegistrationRequest.get_by_email(email)
    if not registration_request:
        return api_alert_response('Unable to find registration.', 400, 'danger')
    return reply_registration_request(registration_request, action)



@user_api.route('/api/v1/login', methods=['POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        form_user = User.get_user(form.username.data)
        if form_user and form_user.check_password(form.password.data):
            if login_user(form_user):
                return jsonify(authed=True, 
                               username=form_user.username,
                               is_admin=form_user.is_admin)
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
    return jsonify(authed=False, username=None, is_admin=False)
