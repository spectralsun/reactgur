from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Boolean, Text, \
    ForeignKey
from sqlalchemy.orm import relationship, backref

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

    @classmethod
    def get_latest(cls):
        return cls.query.filter(cls.thumbnail_id != None).all()

    def get_absolute_path(self):
        return UPLOAD_PATH + self.filename

    def to_json(self):
        json = dict(
            href=UPLOAD_WEB_PATH + self.filename,
            name=self.name,
            width=str(self.width),
            height=str(self.height)
        )
        if self.thumbnail:
            json['thumbnail'] = self.thumbnail.to_json()
        return json
