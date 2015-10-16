# Flask config
SECRET_KEY = 'this is not secret so you should change it'

# Database config
DATABASE_URL = 'sqlite:///sqlite.db'

# Reactgur Config
APP_NAME = 'reactgur'
EXTERNAL_URL = 'http://localhost:5000'
REQUEST_REGISTRATION = False # Accounts must be requested
REQUEST_REGISTRATION_EMAIL = '' # Email notified when accounts are requested
IMAGE_ACCEPT_MIMES = ['image/jpeg', 
                      'image/png', 
                      'image/gif', 
                      'image/x-ms-bmp']
THUMBNAIL_SIZE = (180, 180)                      
UPLOAD_PATH = 'static/uploads/'
UPLOAD_REQUIRES_LOGIN = True
USER_MUST_BE_ENABLED = False
USER_MUST_BE_VERIFIED = False


MAIL_SERVER = 'localhost'
MAIL_PORT = 25
MAIL_USE_TLS = False
MAIL_USE_SSL = False
MAIL_USERNAME = None
MAIL_PASSWORD = None
MAIL_DEFAULT_SENDER = None
MAIL_MAX_EMAILS = None
MAIL_ASCII_ATTACHMENTS = False
