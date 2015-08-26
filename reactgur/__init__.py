import os
import random

import bleach
import magic
from flask import Flask, render_template, request, session, \
    send_from_directory
from flask.ext.assets import Environment, Bundle
from PIL import Image, ImageOps, ImageChops

from reactgur.blueprints import user
from reactgur.models import Media
from reactgur.util import ExtensibleJSONEncoder, jsonify, generate_filename


app = Flask(__name__)
app.json_encoder = ExtensibleJSONEncoder
try:
    app.config.from_object('config')
except: 
    app.config.from_object('configdist')

app.register_blueprint(user_bp)

assets = Environment(app)

css = Bundle('bootstrap/css/bootstrap-theme.min.css',
             'bootstrap/css/bootstrap.min.css',
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

@app.route('/')
def index():
    return render_template('index.html', images=dumps(Media.get_latest()))

@app.route('/upload', methods=['POST'])
def upload():
    if not request.files:
        return []

    uploaded = []
    magic_mime = magic.Magic(mime=True)

    for key, upload in request.files.iteritems():
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
        filename = generate_filename(_upload_path, _image_extensions[mime])
        filepath = _upload_path + filename
        upload.save(filepath)

        # Get image details
        im = Image.open(filepath)
        # Convert image to jpeg if bmp
        if mime == 'image/x-ms-bmp':
            filename = generate_filename(_upload_path, 
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
    return jsonify(uploaded)

@app.route('/<path:filename>')
def catch_all(filename):
    return send_from_directory(app.config['UPLOAD_PATH'], filename, 
        as_attachment=True)