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
from reactgur.blueprints import user_bp, media_bp
from reactgur.blueprints.user import login_manager
from reactgur.models import Media
from reactgur.util import ExtensibleJSONEncoder


app = Flask(__name__)
app.json_encoder = ExtensibleJSONEncoder
try:
    app.config.from_object('config')
except: 
    app.config.from_object('configdist')

app.register_blueprint(media_bp)
app.register_blueprint(user_bp)

csrf = CsrfProtect(app)

login_manager.init_app(app)

# Configure paths
root = os.path.dirname(os.path.abspath(__file__))
print root
app.config['UPLOAD_PATH'] = upload_path = os.path.join(root, '../uploads')
theme_path = os.path.join(root, 'static/theme') 
theme_files = tuple([f for f in os.listdir(theme_path) \
                     if os.path.isfile(os.path.join(theme_path, f))])

assets = Environment(app)
assets.load_path = [
    root + '/../node_modules',
    root + '/static/css',
    theme_path
]
css = Bundle('bootstrap/dist/css/bootstrap.min.css',
             'base.css',
              Bundle(*theme_files))
assets.register('css', css)

@app.teardown_appcontext
def shutdown_session(response):
    database.session.remove()

@app.route('/')
@app.route('/<path:filename>')
def index(filename=None):
    # Check if its an image to render
    print os.path.join(upload_path, filename)
    if filename and os.path.exists(os.path.join(upload_path, filename)):
        return send_from_directory(upload_path, filename, 
            as_attachment=True)
    context = dict(images=dumps(Media.get_latest()))
    context['app_name'] = app.config['APP_NAME']
    context['app_conf'] = dumps(dict(
        request_registration=app.config['REQUEST_REGISTRATION'],
        upload_login_required=app.config['UPLOAD_LOGIN_REQUIRED']
    ))
    app_data = dict(authed=current_user.is_authenticated())
    if current_user.is_authenticated():
        app_data['username'] = current_user.username
    context['app_data'] = dumps(app_data)
    return render_template('index.html', **context)