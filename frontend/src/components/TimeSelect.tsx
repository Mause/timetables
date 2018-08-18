import * as React from 'react';
import { Component, createRef, RefObject } from 'react';

interface ITimeSelectProps {
  ref: RefObject<TimeSelect>;
  defaultValue: string;
}

class TimeSelect extends Component<ITimeSelectProps, {}, {}> {
  private timeRef = createRef<HTMLInputElement>();
  constructor(props: ITimeSelectProps) {
    super(props);
    this.get = this.get.bind(this);
  }
  public render() {
    return (
      <input type="time" ref={this.timeRef} defaultValue={this.props.defaultValue} />
    );
  }
  public get() {
    return this.timeRef!.current!.valueAsDate;
  }
}

export default TimeSelect;
