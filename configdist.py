# Flask config
SECRET_KEY = 'this is not secret so you should change it'

# Database config
DATABASE_URL = 'sqlite:///sqlite.db'

# Reactgur Config
APP_NAME = 'reactgur'
REQUEST_REGISTRATION = False # Accounts must be requested
REQUEST_REGISTRATION_EMAIL = '' # Email notified when accounts are requested
IMAGE_ACCEPT_MIMES = ['image/jpeg', 
                      'image/png', 
                      'image/gif', 
                      'image/x-ms-bmp']
THUMBNAIL_SIZE = (90, 90)                      
UPLOAD_PATH = 'reactgur/static/uploads/'
UPLOAD_WEB_PATH = 'static/uploads/'
UPLOAD_LOGIN_REQUIRED = True
USER_MUST_BE_ENABLED = False
USER_MUST_BE_VERIFIED = False