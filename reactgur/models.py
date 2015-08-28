from datetime import datetime

from flask import current_app
from sqlalchemy import Column, DateTime, Integer, String, Boolean, Text, \
    ForeignKey, or_
from sqlalchemy.orm import relationship, backref
from werkzeug.security import check_password_hash, generate_password_hash

from reactgur.database import Model

try:
    from config import UPLOAD_WEB_PATH, UPLOAD_PATH
except:
    from configdist import UPLOAD_WEB_PATH, UPLOAD_PATH


class Media(Model):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), unique=True)
    name = Column(String(255))
    width = Column(Integer)
    height = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)
    thumbnail_id = Column(Integer, ForeignKey('media.id'))
    thumbnail = relationship('Media', remote_side=[id],
        backref=backref('original', uselist=False))
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship('User', backref='media')

    @classmethod
    def get_latest(cls):
        return cls.query.filter(cls.thumbnail_id != None).all()

    def get_absolute_path(self):
        return UPLOAD_PATH + self.filename

    def to_json(self):
        json = dict(
            href='/' + self.filename,
            name=self.name,
            width=str(self.width),
            height=str(self.height)
        )
        if self.thumbnail:
            json['thumbnail'] = self.thumbnail.to_json()
        return json

class UserRegistrationRequest(Model):
    """
    User registration request model
    """
    __tablename__ = 'user_registration_request'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    granted = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    token = Column(String(255))

    def __init__(self, email):
        self.email = email.lower()

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter(cls.email == email).first()

class User(Model):
    """
    User model
    """
    __tablename__ = 'user'
    id = Column(Integer, primary_key=True)
    username = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), unique=True)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime)
    verified = Column(Boolean, default=False)
    enabled = Column(Boolean, default=False)
    token = Column(String(255))

    def __init__(self, username, email, password):
        self.username = username.lower()
        self.email = email.lower()
        self.password = generate_password_hash(password=password,
                                               method='pbkdf2:sha512',
                                               salt_length=128)

    def check_password(self, password):
        """Check a user's password (includes salt)"""
        return check_password_hash(self.password, password)

    def is_active(self):
        if current_app.config['USER_MUST_BE_ENABLED'] and not self.enabled:
            return False
        if current_app.config['USER_MUST_BE_VERIFIED'] and not self.verified:
            return False
        return True

    def is_anonymous(self):
        return False

    def is_authenticated(self):
        return True

    def get_id(self):
        return unicode(self.id)

    @classmethod
    def get_user(cls, username_or_email):
        return cls.query.filter(or_(cls.username == username_or_email, 
                                    cls.email == username_or_email)).first()
    @classmethod
    def get_user_by_username(cls, username):
        return cls.query.filter(cls.username == username).first()

    @classmethod
    def get_user_by_email(cls, email):
        return cls.query.filter(cls.email == email).first()

    def to_json(self):
        return dict(
            username=self.username,
            email=self.email,
            created=self.created.strftime('%m/%d/%Y %H:%M:%S'))
