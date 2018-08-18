import { Box, Title } from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Component } from 'react';
import { Query, QueryResult } from 'react-apollo';
import { Route, Switch } from 'react-router-dom';
import Classes from './Classes';
import NaiveTimetable from './NaiveTimetable';
import { IStudent } from './types';

interface IAppQuery {
  student: IStudent;
}

class Student extends Component<{}, {}, {}> {
  public render() {
    return (
      <Route path="/student/:id">
        {props => !props.match ? null : (
          <Query
            query={gql`
              query AppQuery($id: ID!) {
                __typename
                student(id: $id) {
                  id
                  name
                  __typename
                }
              }
            `}
            variables={{ id: props.match.params.id }}
          >
            {({ loading, data }: QueryResult<IAppQuery>) => {
              if (loading || data === undefined) {
                return <div>...</div>;
              }

              const { student } = data;

              // tslint:disable-next-line jsx-no-lambda
              const classes = () => <Classes student={student} />;
              // tslint:disable-next-line jsx-no-lambda
              const timetables = () => <NaiveTimetable student={student} />;

              return (
                <div>
                  <Title>{student.name}'s timetables</Title>
                  <Box>
                    <Switch>
                      <Route
                        exact={true}
                        path="/student/:id/classes"
                        render={classes}
                      />
                      <Route
                        exact={true}
                        path="/student/:id/timetables"
                        render={timetables}
                      />
                    </Switch>
                  </Box>
                </div>
              );
            }}
          </Query>
        )}
      </Route>
    );
  }
}

export default Student;
