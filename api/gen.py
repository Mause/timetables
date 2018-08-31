import graphene
from arrow import Arrow
from pony.orm.core import EntityMeta

from db import db


def typer(column):
    MAP = {
        Arrow: graphene.DateTime
    }

    if column.is_string:
        return graphene.String

    ty = column.py_type
    if ty in MAP:
        return MAP[ty]

    if isinstance(ty, EntityMeta):
        return graphene.ID
    else:
        return ty


def type_pair(attr):
    ty = typer(attr)
    name = attr.name

    if ty == graphene.ID:
        name = name + 'Id'

    if attr.is_required:
        ty = graphene.NonNull(ty)

    return name, graphene.Argument(ty)


def generate_delete_mutation(ot):
    def mutate(self, info, id):
        inst = table.get(id=id)
        inst.delete()
        return mutation(inst)

    arguments = type(
        'Arguments',
        (),
        {
            'id': graphene.Argument(
                graphene.NonNull(
                    graphene.ID
                )
            )
        }
    )

    name = ot.__name__
    table = getattr(db, name)
    field_name = name[0].lower() + name[1:]

    mutation = type(
        'Delete' + name,
        (graphene.Mutation,),
        {
            field_name: graphene.Field(ot),
            'mutate': mutate,
            'Arguments': arguments
        }
    )

    return mutation.Field()


def generate_mutation(ot, arguments):
    def mutate(self, info, **kwargs):
        for key, value in raw_arguments.items():
            if value.type == graphene.ID or value.type.of_type == graphene.ID:
                id = kwargs.pop(key)
                key = key[:-2]
                kwargs[key] = getattr(db, key.title()).get(id=id)
        thing = table(**kwargs)
        db.commit()
        return mutation(thing)

    name = ot.__name__
    table = getattr(db, name)
    raw_arguments = dict(
        type_pair(attr)
        for attr in table._attrs_
        if attr.name in arguments
    )

    arguments = type('Arguments', (), raw_arguments)

    field_name = name[0].lower() + name[1:]

    mutation = type(
        'Create' + name,
        (graphene.Mutation,),
        {
            field_name: graphene.Field(ot),
            'mutate': mutate,
            'Arguments': arguments
        }
    )

    return mutation.Field()
