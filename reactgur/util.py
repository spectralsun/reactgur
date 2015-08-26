import simplejson as json
from flask.json import dumps
from werkzeug import secure_filename


class ExtensibleJSONEncoder(json.JSONEncoder):
    """A JSON encoder that returns the to_json method if present"""
    def default(self, obj):
        if hasattr(obj, 'to_json'):
            return obj.to_json()
        return super(ExtensibleJSONEncoder, self).default(obj)

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

def random_string(length=16):
    """Generates a random string containing a-z A-Z 0-9"""
    pool = range(48, 57) + range(65, 90) + range(97, 122)
    return ''.join(chr(random.choice(pool)) for _ in range(length))

def generate_filename(basepath, extension):
    """Generate an unused filename"""
    exists = True
    while exists:
        filename = secure_filename(random_string() + extension)
        path = basepath + filename
        exists = os.path.exists(path)
    return filename