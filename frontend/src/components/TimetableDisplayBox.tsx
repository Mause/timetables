import * as React from 'react';
import { Component } from 'react';
/* import SingleTimetable from './Sing
leTimetable';
*/
import { ITimetable } from './types';

interface ITimetableDisplayBoxProps {
  timetables: ITimetable[];
}

class TimetableDisplayBox extends Component<ITimetableDisplayBoxProps, {}, {}> {
  public render() {
    if (this.props.timetables.length === 0) {
      return <div>No results.</div>;
    }

    return (
      <div className="display_box">
        {/*<SingleTimetable timetables={this.props.timetables} />*/}
      </div>
    );
  }
}

export default TimetableDisplayBox;
