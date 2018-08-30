import os
import logging
import calendar
import traceback
from functools import wraps

import yaml
import flask
import graphene
from pony.flask import Pony
from flask_cors import CORS
from flask_graphql import GraphQLView
from pony.flask import Pony
from passlib.context import CryptContext
from flask_jwt import JWT, current_identity, _default_jwt_payload_handler

from db import db
from gen import generate_mutation, generate_delete_mutation
from lib import calculator
from lib.loader import spec_parse_time, parse_times

logging.basicConfig(level=logging.DEBUG)

app = flask.Flask(__name__)
app.config.update({
    'DEBUG': False,
    'SECRET_KEY': 'secret_xxx',
    'JWT_AUTH_URL_RULE': None,
})
CORS(app)
Pony(app)
CRYPT_CONTEXT = CryptContext(schemes=['scrypt', 'bcrypt'])

day_names = list(calendar.day_name)

logging.basicConfig(level=logging.INFO)

jwt = JWT(None, None, lambda payload: db.Student.get(id=payload['id']))
jwt.auth_request_callback = None
jwt.jwt_payload_callback = lambda identity: dict(
    _default_jwt_payload_handler(identity),
    username=identity.name
)
jwt.init_app(app)


def do_404(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except FileNotFoundError:
            return flask.abort(404)
    return wrapper


def parse_time_constraint(param):
    than = spec_parse_time(param)

    # get the timedelta for comparison's sake
    return than - than.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )


def get_filters(body):
    # if a day isn't checked, it is considered invalid
    # and any timetables with classes on said days are
    # filtered out

    if body.get('days'):
        invalid_days = [
            day
            for day in day_names
            if not body['days'][day]
        ]
        yield lambda days: not calculator.classes_on_days(days, invalid_days)

    body.update({
        k: parse_time_constraint(body[k])
        for k in ['endEarlierThan', 'startLaterThan']
        if body.get(k)
    })

    if body.get('endEarlierThan'):
        yield (
            lambda days:
            calculator.average_ending_time(days) < body['endEarlierThan']
        )

    if body.get('startLaterThan'):
        yield (
            lambda days:
            calculator.average_starting_time(days) > body['startLaterThan']
        )


t = lambda name: lambda self, info: getattr(self, name).datetime


class ClassInstance(graphene.ObjectType):
    id = graphene.ID()
    start = graphene.DateTime()
    end = graphene.DateTime()
    location = graphene.String()
    class_ = graphene.Field(lambda: Class, name='class')

    resolve_start = t('start')
    resolve_end = t('end')

    def resolve_class_(self, info):
        return getattr(self, 'class')


class Class(graphene.ObjectType):
    id = graphene.ID()
    name = graphene.String()
    instances = graphene.List(ClassInstance)

    def resolve_instances(self, info):
        return sorted(self.instances)


class Day(graphene.ObjectType):
    id = graphene.ID()
    index = graphene.Int()
    classes = graphene.List(ClassInstance)


class Timetable(graphene.ObjectType):
    id = graphene.ID()
    days = graphene.List(Day)


Days = type('Days', (graphene.InputObjectType,), {
    name: graphene.Argument(graphene.Boolean)
    for name in day_names
})


class Student(graphene.ObjectType):
    id = graphene.ID()
    sid = graphene.String()
    name = graphene.String()
    classes = graphene.List(Class)
    timetables = graphene.Field(
        graphene.List(Timetable),
        startLaterThan=graphene.Argument(graphene.DateTime),
        endEarlierThan=graphene.Argument(graphene.DateTime),
        days=graphene.Argument(Days)
    )

    def resolve_classes(self, info):
        return self.classes.order_by(db.Class.id)

    def resolve_timetables(self, info, **kwargs):
        def make_day(tid, index, day):
            return Day(
                id=f'{tid}.{index}',
                index=index,
                classes=day
            )

        def make(timetable):
            tid = calculator.determine_hash(timetable)
            return Timetable(
                id=tid,
                days=[
                    make_day(tid, index, timetable.get(index, []))
                    for index in range(7)
                ]
            )

        possibles = calculator.all_possible_class_combinations(
            cl.instances
            for cl in self.classes
            if cl.instances
        )

        filters = list(get_filters(kwargs))

        return [
            make(timetable)
            for timetable in possibles
            if all(
                filt(timetable)
                for filt in filters
            )
        ]


class Query(graphene.ObjectType):
    student = graphene.Field(
        Student,
        id=graphene.NonNull(graphene.ID)
    )
    students = graphene.List(Student)

    def resolve_student(self, info, id):
        return db.Student.get(id=id)

    def resolve_students(self, info):
        return list(db.Student.select())


class Login(graphene.Mutation):
    class Arguments:
        username = graphene.NonNull(graphene.String)
        password = graphene.NonNull(graphene.String)

    student = graphene.Field(Student)
    token = graphene.String()

    def mutate(self, info, username, password):
        user = db.Student.get(sid=username)

        if not user:
            CRYPT_CONTEXT.dummy_verify()
            raise Exception('Invalid username')

        if not CRYPT_CONTEXT.verify(password, user.password):
            raise Exception('Invalid password')

        return Login(user, jwt.jwt_encode_callback(user).decode())


class CreateStudent(graphene.Mutation):
    class Arguments:
        name = graphene.NonNull(graphene.String)
        sid = graphene.NonNull(graphene.String)
        login = graphene.NonNull(graphene.String)
        password = graphene.NonNull(graphene.String)

    student = graphene.Field(Student)

    def mutate(self, info, **kwargs):
        kwargs['password'] = CRYPT_CONTEXT.hash(kwargs['password'])
        return CreateStudent(db.Student(**kwargs))


class Import(graphene.Mutation):
    class Arguments:
        userId = graphene.NonNull(graphene.ID)
        raw = graphene.NonNull(graphene.String)

    success = graphene.Boolean()

    def mutate(self, info, userId, raw):
        user = db.Student.get(id=userId)
        if not user:
            raise Exception('No such user')
        try:
            data = yaml.load(raw)
        except Exception:
            traceback.print_exc()
            raise Exception('Invalid yaml')

        if not isinstance(data, dict):
            raise Exception('Invalid yaml')

        for name, times in data.items():
            clazz = db.Class(name=name, student=user)

            for time in set(times):
                start, end = parse_times(time)
                db.ClassInstance(**{
                    'class': clazz,
                    'start': start,
                    'end': end,
                    'location': 'idk'
                })

        return Import(True)


class Mutation(graphene.ObjectType):
    create_student = CreateStudent.Field()
    login = Login.Field()

    create_class = generate_mutation(Class, ('student', 'name'))
    create_class_instance = generate_mutation(
        ClassInstance,
        ('class', 'start', 'end', 'location')
    )
    delete_class_instance = generate_delete_mutation(ClassInstance)
    delete_class = generate_delete_mutation(Class)
    import_classes = Import.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
app.add_url_rule(
    '/graphiql',
    view_func=GraphQLView.as_view('graphiql', schema=schema, graphiql=True)
)


@app.route('/graphql', methods=['POST'])
def graphql():
    request = flask.request.get_json()
    er = schema.execute(
        operation_name=request['operationName'],
        variables=request['variables'],
        request_string=request['query']
    )
    return flask.jsonify(er.to_dict())


@app.route('/schema')
def schema_route():
    s = str(schema)
    s = '<br/>'.join(s.splitlines())
    s = s.replace(' ', '&nbsp;')
    return f'<code>{s}</code>'


def main():
    app.run(
        debug=True,
        port=int(os.environ.get('PORT', 5000)),
        host='0.0.0.0'
    )


if __name__ == '__main__':
    main()
