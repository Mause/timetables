import { DataProxy } from 'apollo-cache';
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
import * as _ from 'underscore';

import { GET_CLASSES } from './Classes';
import { IClass, IStudent, IStudentShell } from './types';

interface IImportData {
  importClasses: {
    classes: IClass[];
  };
}

type IImportOptions = MutationOptions<
  IImportData,
  { userId: string; raw: string }
>;

interface IImportProps {
  student: IStudentShell;
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
      const { errors } = await this.props.Import({
        update: _.partial(update, this.props.student),
        variables: {
          raw,
          userId: this.props.student.id,
        },
      });

      if (errors) {
        this.setState({ error: errors[0].message });
      } else {
        this.taRef!.current!.value = '';
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

function update(
  student: IStudent,
  cache: DataProxy,
  data: FetchResult<{ classes: IClass[] }>,
) {
  const { classes } = data!.data!;
  const arg = {
    query: GET_CLASSES,
    variables: { id: student.id },
  };
  const res = cache.readQuery<{ student: IStudent }>(arg);
  res!.student!.classes!.push(...classes);
  cache.writeQuery({
    ...arg,
    data: { student: res!.student },
  });
}

const ImportMutation = gql`
  mutation ImportMutation($userId: ID!, $raw: String!) {
    importClasses(userId: $userId, raw: $raw) {
      classes {
        id
        name
        __typename
        instances {
          id
          start
          end
          location
          class {
            id
          }
          __typename
        }
      }
    }
  }
`;

export default compose(graphql(ImportMutation, { name: 'Import' }))(Import);
