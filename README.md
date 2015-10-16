# Reactgur

A simple reactjs/flask app for uploading images.

## Requirements

* [python 2.7.X](https://www.python.org/download/releases/2.7/)
* [pip](https://pip.pypa.io/en/stable/)
* [virtualenv](https://virtualenv.pypa.io/en/latest/)
* [npm](https://npmjs.com)

## Setup

    $ git clone https://github.com/spectralsun/reactgur
    $ cd reactgur
    $ npm install 
    $ virtualenv venv
    $ echo "\n\nexport PYTHONPATH=$(pwd)" >> venv/bin/activate
    $ source venv/bin/activate
    $ pip install -r requriements.txt
    $ alembic upgrade head
    $ mkdir uploads

## Build javascript bundle

    $ ./manage.py build_js

## Build external CSS

    $ ./manage.py build_external_css

## Running the development server

    $ ./manage.py runserver -dr

Go to [localhost:5000](http://localhost:5000) in your browser.