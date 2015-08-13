from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from blinker import Namespace

try:
    from config import DATABASE_URL
except:
    from configdist import DATABASE_URL

class BaseModel(object):
    """Base class for all database Models"""

    def __init__(self):
        super(BaseModel, self).__init__()

    @classmethod
    def get(self, id):
        return self.query.filter(self.id == id).first()

    @classmethod
    def gets(self, ids):
        return self.query.filter(self.id.in_(ids)).all()

    @classmethod
    def get_slug(self, slug):
        return self.query.filter(self.slug == slug).first()

    @classmethod
    def all(self):
        return self.query.all()

    def save(self, commit=True):
        self.db.add(self)
        if commit:
            self.db.commit()
        self._saved()

    @classmethod
    def _saved(self): 
        self.model_saved.send(self)

    @classmethod
    def onsaved(self, callback):
        self.model_saved.connect(callback, self)

    def delete(self, commit=True):
        self.db.delete(self)
        if commit:
            self.db.commit()
        self._deleted()

    @classmethod
    def _deleted(self):
        self.model_deleted.send(self)

    @classmethod
    def ondeleted(self, callback):
        self.model_deleted.connect(callback, self)

engine = create_engine(DATABASE_URL, convert_unicode=True)
session = scoped_session(sessionmaker(autocommit=False, 
                                         autoflush=False, 
                                         bind=engine))

model_signals = Namespace() 

Model = declarative_base(name="Model", cls=BaseModel)
Model.db = session
Model.query = session.query_property() 
Model.model_saved = model_signals.signal('model-saved')
Model.model_deleted = model_signals.signal('model-deleted')
