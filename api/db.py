from pony import orm
from arrow import Arrow
from flask_login import UserMixin
from datetime import datetime

db = orm.Database()


class ArrowConverter(orm.dbapiprovider.DatetimeConverter):
    def sql2py(self, val):
        try:
            return Arrow.fromtimestamp(val)
        except Exception:
            return val

    def validate(self, val, obj):
        if not isinstance(val, Arrow):
            import arrow
            return arrow.get(val)

        return val

    def py2sql(self, val):
        return val.datetime.timestamp()


ClassInstance = type(
    'ClassInstance', (db.Entity,),
    {
        'start': orm.Required(Arrow),
        'end': orm.Required(Arrow),
        'location': orm.Required(str),
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


db.bind('sqlite', 'db.db', create_db=True)
db.provider.converter_classes.append((Arrow, ArrowConverter))
db.generate_mapping(create_tables=True, check_tables=True)
