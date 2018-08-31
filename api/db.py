import os
import arrow
from pony import orm
from arrow import Arrow
from flask_login import UserMixin
from datetime import datetime

db = orm.Database()


class ArrowConverter(orm.dbapiprovider.DatetimeConverter):

    @property
    def sql_type_name(self):
        return self.provider.get_converter_by_py_type(datetime).sql_type_name

    def sql2py(self, val):
        if isinstance(val, str):
            return arrow.get(val)
        else:
            return Arrow.fromdatetime(super().sql2py(val))

    def validate(self, val, obj):
        if not isinstance(val, Arrow):
            import arrow
            return arrow.get(val)

        return val

    def py2sql(self, val):
        return super().py2sql(val.datetime)


ClassInstance = type(
    'ClassInstance', (db.Entity,),
    {
        'start': orm.Required(Arrow),
        'end': orm.Required(Arrow),
        'location': str,
        'class': orm.Required('Class'),
    }
)


class Class(db.Entity):
    name = orm.Required(str)
    student = orm.Required('Student')
    instances = orm.Set(ClassInstance)


class Student(db.Entity, UserMixin):
    name = orm.Required(str)
    sid = orm.Required(str)
    classes = orm.Set(Class)

    login = orm.Required(str, unique=True)
    password = orm.Required(str)
    last_login = orm.Optional(datetime)


db_url = os.environ.get('DATABASE_URL')
if db_url:
    db.bind('postgres', db_url)
else:
    db.bind('sqlite', 'db.db', create_db=True)
db.provider.converter_classes.append((Arrow, ArrowConverter))
db.generate_mapping(create_tables=True, check_tables=True)
