import calendar
from hashlib import md5
from operator import attrgetter
from itertools import product, tee
from collections import defaultdict

from loader import load_classes
from renderer import render


DAYS = dict(zip(calendar.day_name, range(len(calendar.day_name))))


def pairs(iterable):
    first, second = tee(iterable)
    next(second)
    return zip(first, second)


def overlaps_on_day(day):
    day = sorted(
        day,
        key=attrgetter('start')
    )
    return any(
        first.end > second.start
        for first, second in pairs(day)
    )


def sort_into_days(classes):
    days = defaultdict(list)

    for class_ in classes:
        days[class_.start.weekday()].append(class_)

    return dict(days)


def overlaps_on_days(days):
    return any(
        overlaps_on_day(classes)
        for classes in days.values()
    )


def none_on_bad_days(days):
    return not any(
        days.get(DAYS[day_name])
        for day_name in {'Thursday', 'Tuesday', 'Friday'}
    )


def main():
    classes = list(load_classes())


    possibles = product(*classes)
    possibles = map(sort_into_days, possibles)
    possibles = filter(lambda days: not overlaps_on_days(days), possibles)

    # user specifyable
    possibles = filter(none_on_bad_days, possibles)

    for possible in possibles:
        img = render(possible)

        filename = sorted(
            (key, sorted(value))
            for key, value in possible.items()
        )
        filename = str(filename)
        filename = md5(filename.encode()).hexdigest()

        print(filename)
        img.save('possibles/{}.png'.format(filename))


if __name__ == '__main__':
    main()
