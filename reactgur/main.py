import os
import random

import bleach
import magic
import simplejson as json
from flask import Flask, render_template, request, session, \
    send_from_directory
from flask.json import dumps
from flask.ext.assets import Environment, Bundle
from PIL import Image, ImageOps, ImageChops
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
             'lib/lightbox/lightbox.css',
             'lib/fileupload/jquery.fileupload.css',
             'main.css')
assets.register('css', css)

_thumbnail_size = app.config['THUMBNAIL_SIZE']
_image_mimes = app.config['IMAGE_ACCEPT_MIMES']
_image_extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/x-ms-bmp': '.bmp'
}
_upload_path = app.config['UPLOAD_PATH']

def jsonify(*args, **kwargs):
    """Improved json response factory"""
    indent = None
    data = args[0] if args else dict(kwargs)
   
    if app.config['JSONIFY_PRETTYPRINT_REGULAR'] \
       and not request.is_xhr:
        indent = 2
    return app.response_class(dumps(data,
        indent=indent),
        mimetype='application/json')

def _random_string(length=16):
    """Generates a random string containing a-z A-Z 0-9"""
    pool = range(48, 57) + range(65, 90) + range(97, 122)
    return ''.join(chr(random.choice(pool)) for _ in range(length))

def _generate_filename(basepath, extension):
    """Generate an unused filename"""
    exists = True
    while exists:
        filename = secure_filename(_random_string() + extension)
        path = basepath + filename
        exists = os.path.exists(path)
    return filename

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
        name = bleach.clean(name);

        # Save the image to a secure random filename
        filename = _generate_filename(_upload_path, _image_extensions[mime])
        filepath = _upload_path + filename
        upload.save(filepath)

        # Get image details
        im = Image.open(filepath)
        # Convert image to jpeg if bmp
        if mime != 'image/x-ms-bmp':
            filename = _generate_filename(_upload_path, 
                _image_extensions[mime])
            newpath = _upload_path + filename
            im.convert('RGB').save(newpath, 'JPEG')
            im = Image.open(newpath)
            os.remove(filepath)

        # Create thumbnail
        thumbname = _generate_filename(_upload_path, '.jpg')
        thumb = ImageOps.fit(im, _thumbnail_size, Image.ANTIALIAS, (0.5, 0.5))
        if thumb.size[1] < _thumbnail_size[1]:
            thumb = im.crop((0, 0, _thumbnail_size[0], _thumbnail_size[1]))

            offset_x = max((_thumbnail_size[0] - im.size[0]) / 2, 0)
            offset_y = max((_thumbnail_size[1] - im.size[1]) / 2, 0)

            thumb = ImageChops.offset(thumb, offset_x, offset_y)
        thumb.convert('RGB').save(_upload_path + thumbname)
        thumbnail = Media(filename=thumbname,
                          width=_thumbnail_size[0],
                          height=_thumbnail_size[1])

        # Save the media instance 
        media = Media(filename=filename, 
                      name=name, 
                      width=im.size[0], 
                      height=im.size[1],
                      thumbnail=thumbnail)
        media.save()
        uploaded.append(media)
    return uploaded

@app.route('/')
def index():
    return render_template('index.html', images=dumps(Media.get_latest()))

@app.route('/upload', methods=['POST'])
def upload():
    return jsonify(_handle_upload(request.files))

@app.route('/<path:filename>')
def catch_all(filename):
    return send_from_directory(app.config['UPLOAD_PATH'], filename, 
        as_attachment=True)