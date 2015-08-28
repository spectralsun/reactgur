# Flask config
SECRET_KEY = 'this is not secret so you should change it'

# Database config
DATABASE_URL = 'sqlite:///sqlite.db'

IMAGE_ACCEPT_MIMES = ['image/jpeg', 
                      'image/png', 
                      'image/gif', 
                      'image/x-ms-bmp']
THUMBNAIL_SIZE = (90,90)                      
UPLOAD_PATH = 'reactgur/static/uploads/'
UPLOAD_WEB_PATH = 'static/uploads/'