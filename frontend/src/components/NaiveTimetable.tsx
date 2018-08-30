import { Card, CardContent, CardHeader, CardHeaderTitle } from 'bloomer';
import gql from 'graphql-tag';
import * as moment from 'moment';
import * as React from 'react';
import { Component } from 'react';
import { Query } from 'react-apollo';
import * as _ from 'underscore';
import Frame from './Frame';
import renderError from './renderError';
import { IClassInstance, IStudent, ITimetable } from './types';
import WEEKDAYS from './weekdays';

interface INaiveTimetableProps {
  timetable: ITimetable;
}

const fmt = (d: Date) => moment(d).format('hh:mma');

function makeClass(cell: IClassInstance) {
  return (
    <Card>
      <CardHeader>
        <CardHeaderTitle>
          {cell.class.name}
        </CardHeaderTitle>
      </CardHeader>
      <CardContent>
        {fmt(cell.start)} to {fmt(cell.end)} in {cell.location}
      </CardContent>
    </Card>
  );
}

function trim<T>(t: T[]): T[] {return t.slice(0, t.length-2);}

class NaiveTimetable extends Component<INaiveTimetableProps, {}, {}> {
  public render() {
    const rows: IClassInstance[][] = _.unzip(
      this.props.timetable.days.map(t => t.classes),
    ).map(row => _.filter(row, _.identity));

    return (
      <table>
        <thead>
          <tr>{trim(WEEKDAYS).map((name, idx0) => <th key={idx0}>{name}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, idx1) => (
            <tr key={idx1}>
              {row.map((cell, idx2) => (
                <td key={idx2}>
                {makeClass(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

function callback(item: ITimetable) {
  return <NaiveTimetable timetable={item}/>;
}

export default ({ student }: { student: IStudent }) => (
  <Query
    query={gql`
      query NaiveTimetableQuery($id: ID!) {
        student(id: $id) {
          id
          timetables {
            id
            days {
              classes {
                class {
                  name
                }
                start
                end
                location
              }
            }
          }
        }
      }
    `}
    variables={{ id: student.id }}
  >
    {({ data, error, loading }) => {
      if (loading) {
        return 'Loading...';
      }
      if (error) {
        return renderError(error);
      }

      return <Frame<ITimetable> items={data.student.timetables} render={callback} />;
    }}
  </Query>
);
