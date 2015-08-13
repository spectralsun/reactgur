from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Boolean, Text

from reactgur.database import Model

try:
    from config import UPLOAD_WEB_PATH
except:
    from configdist import UPLOAD_WEB_PATH

class Media(Model):
    __tablename__ = 'media'
    id = Column(Integer, primary_key=True)
    path = Column(String(255), unique=True)
    name = Column(String(255))
    width = Column(Integer)
    height = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)

    def to_json():
        return dict(
            path=self.path,
            name=self.name,
            width=str(self.width),
            height=str(self.height)
        )
