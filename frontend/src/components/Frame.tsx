import {
  Box,
  Message,
  MessageBody,
  MessageHeader,
  Page,
  PageControl,
  PageLink,
  PageList,
  Pagination,
} from 'bloomer';
import * as React from 'react';
import { Component, FormEvent, ReactNode } from 'react';

interface IFrameProps<T> {
  items: T[];
  render: (item: T) => ReactNode;
}
interface IFrameState {
  index: number;
}

class Frame<T> extends Component<IFrameProps<T>, IFrameState, {}> {
  constructor(props: IFrameProps<T>) {
    super(props);
    this.state = { index: 0 };
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }
  public render() {
    if (this.props.items.length === 0) {
      return (
        <Message>
          <MessageHeader>
            <p>
              We were unble to create a timetable for you that did not clash
            </p>
          </MessageHeader>
          <MessageBody>
            <p>
              Please review your classes and ensure that you have entered all
              instances of all classes
            </p>
          </MessageBody>
        </Message>
      );
    }
    const current = this.props.items[this.state.index];
    return (
      <div>
        <Pagination>
          <PageControl onClick={this.previous}>Previous</PageControl>
          <PageControl onClick={this.next} isNext={true}>
            Next
          </PageControl>
          <PageList>
            <Page>
              <PageLink isCurrent={true}>
                {this.state.index + 1}/{this.props.items.length}
              </PageLink>
            </Page>
          </PageList>
        </Pagination>
        <Box>{this.props.render(current)}</Box>
      </div>
    );
  }
  private next(ev: FormEvent) {
    const index = this.state.index;
    this.setState({
      index: index < this.props.items.length - 1 ? index + 1 : index,
    });
    return ev.preventDefault();
  }
  private previous(ev: FormEvent) {
    const index = this.state.index;
    this.setState({
      index: index - 1 > -1 ? index - 1 : index,
    });
    return ev.preventDefault();
  }
}

export default Frame;
