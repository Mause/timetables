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
    return (
      <div>
        <Box>
          <Switch>
            <Route exact={true} path="/classes" render={this.classes} />
            <Route exact={true} path="/timetables" render={this.timetables} />
            <Route exact={true} path="/import" render={this.importComp} />
            <Route exact={true} path="/" render={this.root} />
          </Switch>
        </Box>
      </div>
    );
  }
  private classes() {
    return <Classes student={this.props.student} />;
  }
  private timetables() {
    return <NaiveTimetable student={this.props.student} />;
  }
  private importComp() {
    return <Import student={this.props.student} />;
  }
  private root() {
    return <Redirect to="/classes" />;
  }
}

export default Student;
