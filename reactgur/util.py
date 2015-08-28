import simplejson as json
from flask import request, current_app
from flask.json import dumps
from werkzeug import secure_filename


class ExtensibleJSONEncoder(json.JSONEncoder):
    """A JSON encoder that returns the to_json method if present"""
    def default(self, obj):
        if hasattr(obj, 'to_json'):
            return obj.to_json()
        return super(ExtensibleJSONEncoder, self).default(obj)

def jsonify(*args, **kwargs):
    """
    Returns a json response
    """
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