import * as React from 'react';
import { Component } from 'react';
import * as _ from 'underscore';
import WEEKDAYS from './weekdays';

export type IDays = Readonly<Map<string, boolean>>;

interface IDayNamesProps {
  onChange: (state: IDays) => void;
}

class DayNames extends Component<IDayNamesProps, Map<string,boolean>, {}> {
  constructor(props: IDayNamesProps) {
    super(props);
    this.state = _.object(
      _.map(WEEKDAYS, name => ([name, false]))
    );
    this.onChange = this.onChange.bind(this);
  }
  public render() {
    return (
      <div>
        {WEEKDAYS.map(day => (
          <label key={day}>
            <input
              type="checkbox"
              onChange={this.onChange}
              defaultChecked={true}
              name={day}
            />
            {day}
          </label>
        ))}
      </div>
    );
  }
  public componentDidMount() {
    // initialise parent
    this.props.onChange(this.state);
  }
  private onChange(ev: any) {
    const t = new Map<string,boolean>();
    t.set(ev.target.name, ev.target.checked);
    this.setState(t);
    this.props.onChange(this.state);
  }
}

export default DayNames;
