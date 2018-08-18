import * as React from 'react';
import { Component, FormEvent } from 'react';
import * as _ from 'underscore';
import DayNames from './DayNames';
import { IDays } from './DayNames';
import TimePointLimit from './TimePointLimit';

interface IFilterFormProps {
  onSubmit: (data: any) => void;
}
export interface IFilterFormState {
  days: IDays;
  startLaterThan: null;
  endEarlierThan: null;
}

class FilterForm extends Component<IFilterFormProps, IFilterFormState, {}> {
  constructor(props: IFilterFormProps) {
    super(props);
    this.state = {
      days: new Map(),
      endEarlierThan: null,
      startLaterThan: null,
    };
    this.daysChanged = this.daysChanged.bind(this);
    this.timePointLimitChanged = this.timePointLimitChanged.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  public render() {
    return (
      <form onSubmit={this.onSubmit}>
        <article>
          <header>
            <h3>Filters</h3>
          </header>

          <section>
            <DayNames onChange={this.daysChanged} />
          </section>

          <section>
            <TimePointLimit
              onChange={_.partial(
                this.timePointLimitChanged,
                'startLaterThan',
              )}
              label="Start later than"
              defaultTime="08:00"
            />
            <TimePointLimit
              onChange={_.partial(
                this.timePointLimitChanged,
                'endEarlierThan',
              )}
              label="End earlier than"
              defaultTime="17:00"
            />
          </section>

          <input type="submit" value="Refresh" />
        </article>
      </form>
    );
  }
  private daysChanged(days: IDays) {
    this.setState({ days });
  }
  private timePointLimitChanged(type: string, ev: string) {
    this.setState(_.object([[type, ev]]));
  }
  private onSubmit(ev: FormEvent<HTMLFormElement>) {
    const data = {
      days: this.state.days,
      endEarlierThan: this.state.endEarlierThan,
      startLaterThan: this.state.startLaterThan,
    };

    this.props.onSubmit(data);

    return ev.preventDefault();
  }
}

export default FilterForm;
