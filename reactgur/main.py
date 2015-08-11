from flask import Flask, render_template
from flask.ext.assets import Environment, Bundle


app = Flask(__name__)

assets = Environment(app)

js = Bundle('lib/jquery.min.js',
            'lib/react/console-polyfill.js',
            'lib/react/es5-sham.min.js',
            'lib/react/es5-shim.min.js',
            'lib/react/JSXTransformer.js',
            'lib/bootstrap/js/bootstrap.min.js',
            'lib/fileupload/jquery.ui.widget.js',
            'lib/fileupload/jquery.iframe-transport.js',
            'lib/fileupload/jquery.fileupload.js',
            'lib/react/react.js',
            'main.js')
assets.register('js', js)

jsx = Bundle('jsx/models.js')
assets.register('jsx', jsx)

css = Bundle('lib/bootstrap/css/bootstrap-theme.min.css',
             'lib/bootstrap/css/bootstrap.min.css')
assets.register('css', css)

@app.route('/')
def index():
    return render_template('index.html')
