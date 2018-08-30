import {
  Button,
  Control,
  Field,
  FieldBody,
  Message,
  MessageBody,
} from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Component, createRef, FormEvent } from 'react';
import { compose, FetchResult, graphql, MutationOptions } from 'react-apollo';
import { IStudent } from './types';

interface IImportData {
  importClasses: {
    success: boolean;
  }
}

type IImportOptions = MutationOptions<
  IImportData,
  { userId: string; raw: string }
>;

interface IImportProps {
  student: IStudent;
  Import: (options: IImportOptions) => FetchResult<IImportData>;
}
interface IImportState {
  submitted: boolean;
  error: string | undefined;
}

class Import extends Component<IImportProps, IImportState, {}> {
  private taRef = createRef<HTMLTextAreaElement>();
  constructor(props: IImportProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.reset = this.reset.bind(this);
    this.state = { submitted: false, error: undefined };
  }
  public render() {
    return (
      <form onSubmit={this.onSubmit}>
        {this.state.error && (
          <Message>
            <MessageBody>{this.state.error}</MessageBody>
          </Message>
        )}

        <Field>
          <FieldBody>
            <Control>
              <textarea ref={this.taRef} className="textarea" onChange={this.reset} rows={20} cols={200} id="raw" />
            </Control>
          </FieldBody>
        </Field>
        <Button type="submit">Submit</Button>
      </form>
    );
  }
  private reset() {
    this.setState({ submitted: false, error: undefined });
  }
  private async onSubmit(ev: FormEvent<any>) {
    ev.preventDefault();

    const raw = this.taRef!.current!.value;

    try {
      const { data, errors } = await this.props.Import({
        variables: {
          raw,
          userId: this.props.student.id,
        },
      });

      if (data!.importClasses.success) {
        this.taRef!.current!.value = '';
      } else if (errors) {
        this.setState({ error: errors[0].message });
      } else {
        this.setState({ error: 'Unknown error' });
      }
    } catch (e) {
      if (e.graphQLErrors) {
        this.setState({ error: e.graphQLErrors[0].message });
        return;
      }
      throw e;
    }
  }
}

const ImportMutation = gql`
  mutation ImportMutation($userId: ID!, $raw: String!) {
    importClasses(userId: $userId, raw: $raw) {
      success
    }
  }
`;

export default compose(graphql(ImportMutation, { name: 'Import' }))(Import);
