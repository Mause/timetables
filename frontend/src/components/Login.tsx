import {
  Button,
  Column,
  Columns,
  Control,
  Field,
  Label,
  Message,
  MessageBody,
  Section,
} from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Component, createRef, FormEvent } from 'react';
import { compose, FetchResult, graphql, MutationOptions } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import { setAuth } from '../client';

interface ILoginData {
  login: {
    token: string;
    student: { name: string; id: string };
  };
}
type ILoginOptions = MutationOptions<
  ILoginData,
  { user: string; password: string }
>;

interface ILoginProps {
  Login: (options: ILoginOptions) => FetchResult<ILoginData>;
  setAuth: (token: string) => void;
}

interface ILoginState {
  userId?: string;
  error?: string;
}

class Login extends Component<ILoginProps, ILoginState, {}> {
  private usernameRef = createRef<HTMLInputElement>();
  private passwordRef = createRef<HTMLInputElement>();
  constructor(props: ILoginProps) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = { userId: undefined };
  }
  public render() {
    if (this.state.userId !== undefined) {
      return (
        <Redirect
          to={{
            pathname: '/',
            state: { userId: this.state.userId },
          }}
        />
      );
    }
    return (
      <Section>
        <Columns>
          <Column isSize="1/2">
            <form onSubmit={this.onSubmit}>
              {this.state.error && (
                <Message>
                  <MessageBody>{this.state.error}</MessageBody>
                </Message>
              )}

              <Field>
                <Label>Username</Label>
                <Control>
                  <input className="input" ref={this.usernameRef} type="text" />
                </Control>
              </Field>
              <Field>
                <Label>Password</Label>
                <Control>
                  <input
                    className="input"
                    ref={this.passwordRef}
                    type="password"
                  />
                </Control>
              </Field>
              <Button type="submit">Login</Button>
            </form>
          </Column>
        </Columns>
      </Section>
    );
  }
  private async onSubmit(ev: FormEvent<any>) {
    ev.preventDefault();
    try {
      const { data, errors } = await this.props.Login({
        variables: {
          password: this.passwordRef!.current!.value,
          user: this.usernameRef!.current!.value,
        },
      });
      if (errors) {
        this.setState({ error: errors[0].message });
        return;
      }
      this.props.setAuth(data!.login.token);
      this.setState({ userId: data!.login.student.id });
      setAuth(data!.login.token);
    } catch (e) {
      this.setState({ error: e.graphQLErrors[0].message });
    }
  }
}

const LoginMutation = gql`
  mutation LoginMutation($user: String!, $password: String!) {
    login(username: $user, password: $password) {
      token
      student {
        id
        name
      }
    }
  }
`;

export default compose(graphql(LoginMutation, { name: 'Login' }))(Login);
