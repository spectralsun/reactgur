import os
import random

import simplejson as json
from flask import request, current_app
from flask.json import dumps
from PIL import Image, ImageOps, ImageChops
from werkzeug import secure_filename


image_extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/x-ms-bmp': '.bmp'
}

class ExtensibleJSONEncoder(json.JSONEncoder):
    """A JSON encoder that returns the to_json method if present"""
    def default(self, obj):
        if hasattr(obj, 'to_json'):
            return obj.to_json()
        return super(ExtensibleJSONEncoder, self).default(obj)

def jsonify(*args, **kwargs):
    """Returns a json response"""
    data = None
    indent = not request.is_xhr
    status = kwargs.pop('_status_code', 200)
    if args:
        data = args[0] if len(args) == 1 else args
    if kwargs:
        if data:
            if type(data) != list:
                data = [data]
            data.append(dict(**kwargs))
        else:
            data = dict(**kwargs)
    return current_app.response_class(dumps(data, indent=indent), 
        status=status,
        mimetype='application/json')    

def convert_to_jpeg():
    filename = generate_filename(upload_path, 
        _image_extensions[mime])
    newpath = upload_path + filename
    im.convert('RGB').save(newpath, 'JPEG')
    im = Image.open(newpath)
    os.remove(filepath)

def get_image_size(image):
    im = Image.open(image)
    return (im.size[0], im.size[1])

def generate_thumbnail(file_path, save_path, thumbnail_size=(90, 90)):
    im = Image.open(file_path)
    thumbname = generate_filename(save_path, '.jpg')
    thumb = ImageOps.fit(im, thumbnail_size, Image.ANTIALIAS, (0.5, 0.5))
    if thumb.size[1] < thumbnail_size[1]:
        thumb = im.crop((0, 0, thumbnail_size[0], thumbnail_size[1]))

        offset_x = max((thumbnail_size[0] - im.size[0]) / 2, 0)
        offset_y = max((thumbnail_size[1] - im.size[1]) / 2, 0)

        thumb = ImageChops.offset(thumb, offset_x, offset_y)
        thumb.convert('RGB')
    thumb.save(os.path.join(save_path, thumbname))
    return thumbname    

def random_string(length=16):
    """Generates a random string containing a-z A-Z 0-9"""
    pool = range(48, 57) + range(65, 90) + range(97, 122)
    return ''.join(chr(random.choice(pool)) for _ in range(length))

def generate_filename(basepath, extension):
    """Generate an unused filename"""
    exists = True
    while exists:
        filename = secure_filename(random_string() + extension)
        path = os.path.join(basepath, filename)
        exists = os.path.exists(path)
    return filename