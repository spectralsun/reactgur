#!/usr/bin/env python
import os
import re
from subprocess import call

from flask.ext.script import Manager

from reactgur import app


manager = Manager(app)

@manager.command
def build_js():
    call([
        'node',
        'node_modules/webpack/bin/webpack.js',
        './webpack.config.js'
    ])

@manager.command
def build_external_css():
    """Configures and builds external CSS libraries"""
    
    # Symbolically link bootstrap font files
    extensions = ['eot', 'svg', 'ttf', 'woff', 'woff2']
    if not os.path.exists('reactgur/static/fonts/bootstrap'):
        os.makedirs('reactgur/static/fonts/bootstrap')
    root = os.path.dirname(os.path.abspath(__file__))
    filename = 'glyphicons-halflings-regular'
    for ext in extensions:
        src = '%s/node_modules/bootstrap/dist/fonts/%s.%s' % \
            (root, filename, ext)
        dest = 'reactgur/static/fonts/bootstrap/%s.%s' % (filename, ext)
        if not os.path.lexists(dest):
            os.symlink(src, dest)

    # Replace font path less variable
    with file('node_modules/bootstrap/less/variables.less') as r:
        variables = r.read()
        r.close()
        variables = re.sub(r'@icon-font-path:.*', 
                           '@icon-font-path: "/static/fonts/bootstrap/";', 
                           variables)
        with file('node_modules/bootstrap/less/variables.less', 'w') as w:
            w.write(variables)
            w.close()

    # Build bootstrap CSS
    os.chdir('node_modules/bootstrap')
    call(['npm', 'install'])
    call(['node', '../../node_modules/grunt-cli/bin/grunt', 'dist'])

if __name__ == '__main__':
    manager.run()
