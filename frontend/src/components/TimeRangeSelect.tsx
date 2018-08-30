import { Control, Field, FieldBody, FieldLabel, Label, Select   } from 'bloomer';
import * as moment from 'moment';
import * as React from 'react';
import { Component, createRef, FormEvent, RefObject } from 'react';
import TimeSelect from './TimeSelect';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const REFERENCE = moment('2016-02-08');

interface ITimeRangeSelectProps {
  ref: RefObject<TimeRangeSelect>;
}
interface ITimeRangeSelectState {
  day: number;
  start: Date;
  end: Date;
}

class TimeRangeSelect extends Component<
  ITimeRangeSelectProps,
  ITimeRangeSelectState,
  {}
> {
  private startRef: RefObject<TimeSelect> = createRef();
  private endRef: RefObject<TimeSelect> = createRef();
  constructor(props: ITimeRangeSelectProps) {
    super(props);
    this.changeDay = this.changeDay.bind(this);
    this.get = this.get.bind(this);
    this.startAsDate = this.startAsDate.bind(this);
    this.endAsDate = this.endAsDate.bind(this);
    this.state = {day: 0, start: new Date(), end: new Date()};
  }
  public render() {
    return (
      <>
        <Field isHorizontal={true}>
          <FieldLabel isNormal={true}>
            <Label>Day:</Label>
          </FieldLabel>
          <FieldBody>
            <Control>
              <Select onChange={this.changeDay}>
                {DAYS.map((name, idx) => <option key={idx}>{name}</option>)}
              </Select>
            </Control>
          </FieldBody>
        </Field>
        <Field isHorizontal={true}>
          <FieldLabel isNormal={true}>
            <Label>Start:</Label>
          </FieldLabel>
          <FieldBody>
            <Control>
              <TimeSelect defaultValue="08:00" ref={this.startRef} />
            </Control>
          </FieldBody>
        </Field>
        <Field isHorizontal={true}>
          <FieldLabel isNormal={true}>
            <Label>End:</Label>
          </FieldLabel>
          <FieldBody>
            <Control>
              <TimeSelect defaultValue="09:00" ref={this.endRef} />
            </Control>
          </FieldBody>
        </Field>
      </>
    );
  }
  public startAsDate(): moment.Moment {
    const date: Date = this.startRef!.current!.get();
    return this.get(date);
  }
  public endAsDate(): moment.Moment {
    const date = this.endRef!.current!.get();
    return this.get(date);
  }
  private get(time: Date) {
    return REFERENCE.clone()
      .add(this.state.day, 'days')
      .hours(time.getHours())
      .minutes(time.getMinutes());
  }
  private changeDay(ev: FormEvent<HTMLSelectElement>) {
    this.setState({ day: ev.currentTarget.selectedIndex });
  }
}

export default TimeRangeSelect;
