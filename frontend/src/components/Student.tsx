import { Box, Title } from 'bloomer';
import * as React from 'react';
import { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import Classes from './Classes';
import Import from './Import';
import NaiveTimetable from './NaiveTimetable';
import { IStudentShell } from './types';

class Student extends Component<{student: IStudentShell}, {}, {}> {
  public render() {
    const student = this.props.student;

    // tslint:disable-next-line jsx-no-lambda
    const classes = () => <Classes student={student} />;
    // tslint:disable-next-line jsx-no-lambda
    const timetables = () => <NaiveTimetable student={student} />;
    // tslint:disable-next-line jsx-no-lambda
    const importComp = () => <Import student={student} />;

    return (
      <div>
        <Title>{student.name}'s timetables</Title>
        <Box>
          <Switch>
            <Route exact={true} path="/classes" render={classes} />
            <Route exact={true} path="/timetables" render={timetables} />
            <Route exact={true} path="/import" render={importComp} />
          </Switch>
        </Box>
      </div>
    );
  }
}

export default Student;
