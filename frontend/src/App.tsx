import {
  Button,
  Container,
  Navbar,
  NavbarBrand,
  NavbarEnd,
  NavbarItem,
  NavbarMenu,
  NavbarStart,
  Title,
} from 'bloomer';
import { decode } from 'jsonwebtoken';
import * as React from 'react';
import { Link, Route, RouteComponentProps, withRouter } from 'react-router-dom';

import 'bulma/css/bulma.css';
import './app.css';
import './normalise.css';

import { setAuth } from './client';
import Debug from './components/Debug';
import Login from './components/Login';
import Student from './components/Student';
import { IStudentShell } from './components/types';

interface IAppProps extends RouteComponentProps<{}, {}, { userId: string | undefined }> {
}
interface IAppState {
  userId: string | undefined;
}

function userDecode(s: string | null): IStudentShell | null {
  if (!s) {
    return null;
  }
  const d: any = decode(s);
  if (!d) {
    return null;
  }
  return {
    id: d.identity,
    name: d.username,
  } as IStudentShell;
}

class App extends React.Component<IAppProps, IAppState, {}> {
  constructor(props: IAppProps) {
    super(props);
    if (props.location.state && props.location.state.userId) {
      this.state = { userId: props.location.state.userId };
    } else {
      this.state = { userId: undefined };
    }
    this.logout = this.logout.bind(this);
  }
  public render() {
    return (
      <Container className="app">
        <Navbar>
          <NavbarBrand>
            <Title>Timetables</Title>
          </NavbarBrand>
          <NavbarMenu>
            <NavbarStart>
              {this.state.userId ? (
                <>
                  <NavbarItem>
                    <Link to={`/student/${this.state.userId}/classes`}>
                      Classes
                    </Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link to={`/student/${this.state.userId}/timetables`}>
                      Timetables
                    </Link>
                  </NavbarItem>
                </>
              ) : null}
            </NavbarStart>
            <NavbarEnd>
              {this.state.userId && (
                <NavbarItem>
                  <Button onClick={this.logout}>Logout</Button>
                </NavbarItem>
              )}
            </NavbarEnd>
          </NavbarMenu>
        </Navbar>

        <Route exact={true} path="/login" component={Login} />
        <Route exact={true} path="/debug" component={Debug} />
        <Student />
      </Container>
    );
  }
  private logout(ev: FormEvent<any>) {
    this.setState({ user: null });
    setAuth(null);
  }
  private setAuth(token: string): void {
    this.setState({ user: userDecode(token) });
  }
}

export default withRouter(App);
