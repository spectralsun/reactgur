import os
import magic
import random

from flask import Flask, render_template, request, session
from flask.json import dumps
from flask.ext.assets import Environment, Bundle
from werkzeug import secure_filename

from reactgur.models import Media


class ExtensibleJSONEncoder(json.JSONEncoder):
    """A JSON encoder that returns the to_json method if present"""
    def default(self, obj):
        if hasattr(obj, 'to_json'):
            return obj.to_json()
        return super(ExtensibleJSONEncoder, self).default(obj)

app = Flask(__name__)
app.json_encoder = ExtensibleJSONEncoder
try:
    app.config.from_object('config')
except: 
    app.config.from_object('configdist')

assets = Environment(app)

js = Bundle('lib/jquery.min.js',
            'lib/react/console-polyfill.js',
            'lib/react/es5-sham.min.js',
            'lib/react/es5-shim.min.js',
            'lib/react/JSXTransformer.js',
            'lib/react/react.js',
            'lib/bootstrap/js/bootstrap.min.js',
            'lib/lightbox/lightbox.min.js',
            'lib/fileupload/jquery.ui.widget.js',
            'lib/fileupload/jquery.iframe-transport.js',
            'lib/fileupload/jquery.fileupload.js',
            'main.js')
assets.register('js', js)

jsx = Bundle('jsx/models.js')
assets.register('jsx', jsx)

css = Bundle('lib/bootstrap/css/bootstrap-theme.min.css',
             'lib/bootstrap/css/bootstrap.min.css',
             'lib/fileupload/jquery.fileupload.css',
             'main.css')
assets.register('css', css)

_image_mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/x-ms-bmp']

def jsonify(*args, **kwargs):
    """Improved json response factory"""
    indent = None
    data = args[0] if args else dict(kwargs)
   
    if current_app.config['JSONIFY_PRETTYPRINT_REGULAR'] \
       and not request.is_xhr:
        indent = 2
    return current_app.response_class(dumps(data,
        indent=indent),
        mimetype='application/json')

def _generate_filename(length=16):
    """Generates a unique file name containing a-z A-Z 0-9"""
    pool = range(48, 57) + range(65, 90) + range(97, 122)
    return ''.join(chr(random.choice(pool)) for _ in range(length))

def _handle_upload(files):
    if not files:
        return []

    uploaded = []
    magic_mime = magic.Magic(mime=True)

    for key, upload in files.iteritems():
        # Check MIME
        mime = magic_mime.from_buffer(upload.stream.read(1024))
        if mime not in _image_mimes:
            continue
        # Rewind file stream
        upload.stream.seek(0)

        # Get original filename
        if '.' not in upload.filename:
            name = upload.filename
        else:
            name, upload.ext = upload.filename.rsplit('.', 1)
        
        # Save the image to a secure random filename
        exists = True
        while exists:
            path = secure_filename(_generate_filename() + '.jpg')
            filepath = app.config['UPLOAD_PATH'] + path
            exists = os.path.exists(filepath)
        upload.save(filepath)

        # Get image details
        im = Image.open(filepath)
        # Convert image to jpeg if not jpeg or png
        if mime != 'image/jpeg' and mime != 'image/png':
            im.convert('RGB').save(filepath, 'JPEG')

        # Save the media instance 
        media = Media(name=name, path=path, width=im.size[0], height=im.size[1])
        media.save()
        uploaded.append(media)
    return uploaded

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    return jsonify(_handle_upload(request.files))