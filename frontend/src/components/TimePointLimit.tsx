  import * as React from 'react';
import { Component } from 'react';

interface ITimePointLimitProps {
  onChange: (time: string | null) => void;
  label: string;
  defaultTime?: string;
}
interface ITimePointLimitState {
  time: string;
  enabled: boolean;
}

class TimePointLimit extends Component<
  ITimePointLimitProps,
  ITimePointLimitState,
  {}
> {
  constructor(props: ITimePointLimitProps) {
    super(props);
    this.state = { time: '08:00', enabled: false };
    this.checkboxChanged = this.checkboxChanged.bind(this);
    this.timeChanged = this.timeChanged.bind(this);
  }
  public render() {
    return (
      <div>
        <label>
          <input
            type="checkbox"
            onChange={this.checkboxChanged}
            defaultChecked={true}
          />{' '}
          {this.props.label}{' '}
        </label>
        <label>
          <input
            type="time"
            onKeyUp={this.timeChanged}
            defaultValue={this.state.time}
          />{' '}
          on average
        </label>
      </div>
    );
  }
  public componentWillReceiveProps(props: ITimePointLimitProps) {
    if (props.defaultTime) {
      this.setState({ time: props.defaultTime });
    }
    return props;
  }
  public componentDidMount() {
    // initialise parent
    this.props.onChange(null);
  }
  private onChange(enabled: boolean, time: string) {
    this.setState({ enabled, time });
    this.props.onChange(enabled ? time : null);
  }
  private checkboxChanged(ev: any) {
    this.onChange(ev.target.checked, this.state.time);
  }
  private timeChanged(ev: any) {
    this.onChange(this.state.enabled, ev.target.value);
  }
}

export default TimePointLimit;
