import os
from datetime import datetime

from flask import current_app
from sqlalchemy import Column, DateTime, Integer, String, Boolean, Text, \
    ForeignKey, or_, desc
from sqlalchemy.orm import relationship, backref
from werkzeug.security import check_password_hash, generate_password_hash

from reactgur.database import Model


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
    upload_ip_address = Column(String(64))
    is_public = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship('User', backref='media')

    @classmethod
    def get_by_filename(cls, filename):
        return cls.query.filter(cls.filename == filename).first()

    @classmethod
    def get_latest(cls, limit=30):
        return cls.query.filter(cls.thumbnail_id != None) \
                        .order_by(desc(cls.created_at)).limit(limit).all()

    @classmethod
    def get_latest_after(cls, after, limit=30):
        return cls.query.filter(cls.created_at < after.created_at) \
                        .filter(cls.thumbnail_id != None) \
                        .order_by(desc(cls.created_at)).limit(limit).all()

    def get_absolute_path(self):
        return UPLOAD_PATH + self.filename

    def is_owner(self, user):
        return self.user_id == user.id

    def to_json(self):
        json = dict(
            href='/' + self.filename,
            name=self.name,
            width=str(self.width),
            height=str(self.height)
        )
        if self.thumbnail:
            json['thumbnail'] = self.thumbnail.to_json()
        if self.user and self.thumbnail:
            json['user'] = self.user.username
        return json

class UserRegistrationRequest(Model):
    """
    User registration request model
    """
    __tablename__ = 'user_registration_request'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    ip_address = Column(String(255))
    granted = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    token = Column(String(255))

    def __init__(self, email, ip_address):
        self.email = email.lower()
        self.ip_address = ip_address
        self.token = os.urandom(32).encode('base-64')[:-2]

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter(cls.email == email).first()

    @classmethod
    def get_request(cls, email, token):
        print email, token
        return cls.query.filter(cls.email == email) \
                        .filter(cls.token == token).first()

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
    is_admin = Column(Boolean, default=False)
    register_ip_address = Column(String(64))
    token = Column(String(255))

    def __init__(self, username, email, password, ip_address):
        self.username = username.lower()
        self.register_ip_address = ip_address
        self.email = email.lower()
        self.set_password(password)

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
    def get_by_username(cls, username):
        return cls.query.filter(cls.username == username).first()

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter(cls.email == email).first()

    def set_password(self, password):
        self.password = generate_password_hash(password=password,
                                               method='pbkdf2:sha512',
                                               salt_length=128)

    def to_json(self):
        return dict(
            username=self.username,
            email=self.email,
            created=self.created.strftime('%m/%d/%Y %H:%M:%S'))
