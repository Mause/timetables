import { Box } from 'bloomer';
import * as React from 'react';
import { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
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
        <Box>
          <Switch>
            <Route exact={true} path="/classes" render={classes} />
            <Route exact={true} path="/timetables" render={timetables} />
            <Route exact={true} path="/import" render={importComp} />
            <Route exact={true} path="/" render={this.root} />
          </Switch>
        </Box>
      </div>
    );
  }
  private root() {
    return <Redirect to="/classes" />;
  }
}

export default Student;
