import os
import random

import bleach
import magic
from flask import Flask, render_template, request, session, \
    send_from_directory
from flask.ext.assets import Environment, Bundle
from flask.ext.login import current_user
from flask.json import dumps
from flask_wtf import CsrfProtect

from reactgur import database
from reactgur.api import user_api, media_api
from reactgur.api.user import login_manager, anonymous_user_data
from reactgur.mail import mail_session
from reactgur.models import Media
from reactgur.util import ExtensibleJSONEncoder


app = Flask(__name__)
app.json_encoder = ExtensibleJSONEncoder
try:
    app.config.from_object('config')
except: 
    app.config.from_object('configdist')

app.register_blueprint(media_api)
app.register_blueprint(user_api)

csrf = CsrfProtect(app)

mail_session.init_app(app)

login_manager.init_app(app)

# Configure paths
root = os.path.dirname(os.path.abspath(__file__))
app.config['UPLOAD_PATH'] = upload_path = os.path.join(root, '../uploads')
theme_path = os.path.join(root, 'static/theme') 
try:
    theme_files = tuple([f for f in os.listdir(theme_path) \
                         if os.path.isfile(os.path.join(theme_path, f))])
except:
    theme_files = tuple()

assets = Environment(app)
assets.load_path = [
    root + '/../node_modules',
    root + '/../client/style',
    theme_path
]
js = Bundle(
    'isotope-layout/dist/isotope.pkgd.min.js',
    'isotope-packery/packery-mode.pkgd.min.js'
)
assets.register('js', js)
css = Bundle(
    'bootstrap/dist/css/bootstrap.min.css',
    'base.css',
    Bundle(*theme_files)
)
assets.register('css', css)

@app.teardown_appcontext
def shutdown_session(response):
    database.session.remove()

@app.route('/')
@app.route('/<path:filename>')
def index(filename=None):
    # Check if its an image to render
    if filename and os.path.exists(os.path.join(upload_path, filename)):
        return send_from_directory(upload_path, filename)
    context = dict(images=dumps(Media.get_latest()))
    context['app_name'] = app.config['APP_NAME']
    context['app_conf'] = dumps(dict(
        external_url=app.config['EXTERNAL_URL'],
        request_registration=app.config['REQUEST_REGISTRATION'],
        upload_requires_login=app.config['UPLOAD_REQUIRES_LOGIN']
    ))
    app_data = dict(
        user=anonymous_user_data,
        alerts=session.pop('alerts', [])
    )
    if current_user.is_authenticated():
        app_data['user'] = current_user
    context['app_data'] = dumps(app_data)
    return render_template('index.html', **context)