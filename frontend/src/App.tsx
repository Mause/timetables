import {
  Button,
  Container,
  Navbar,
  NavbarBrand,
  NavbarBurger,
  NavbarEnd,
  NavbarItem,
  NavbarMenu,
  NavbarStart,
  Title,
} from 'bloomer';
import { decode } from 'jsonwebtoken';
import * as React from 'react';
import { Component, FormEvent } from 'react';
import {
  Link,
  Redirect,
  Route,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';

import 'bulma/css/bulma.css';
import './app.css';
import './normalise.css';

import { getAuth, setAuth } from './client';
import Debug from './components/Debug';
import Login from './components/Login';
import Student from './components/Student';
import { IStudentShell } from './components/types';

interface IAppProps extends RouteComponentProps<{}, {}, {}> {}
interface IAppState {
  user: IStudentShell | null;
  menuActive: boolean;
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

class App extends Component<IAppProps, IAppState, {}> {
  constructor(props: IAppProps) {
    super(props);
    const auth = getAuth();
    this.state = { user: userDecode(auth), menuActive: false };
    this.setAuth = this.setAuth.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  public render() {
    const isLogin = this.props.location.pathname === '/login';
    if (!isLogin && !this.state.user) {
      return <Redirect to="/login" />;
    } else if (isLogin && this.state.user) {
      return <Redirect to="/" />;
    }

    return (
      <Container className="app">
        <Navbar>
          <NavbarBrand>
            <Title>Timetables</Title>
            <NavbarBurger isActive={this.state.menuActive} onClick={this.toggleMenu} />
          </NavbarBrand>
          <NavbarMenu isActive={this.state.menuActive}>
            <NavbarStart>
              {this.state.user ? (
                <>
                  <NavbarItem>
                    <Link to={`/classes`}>Classes</Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link to={`/timetables`}>Timetables</Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link to={`/import`}>Import</Link>
                  </NavbarItem>
                </>
              ) : null}
            </NavbarStart>
            <NavbarEnd>
              {this.state.user && (
                <NavbarItem>
                  <Button onClick={this.logout}>Logout</Button>
                </NavbarItem>
              )}
            </NavbarEnd>
          </NavbarMenu>
        </Navbar>

        <Route exact={true} path="/login" render={this.login} />
        <Route exact={true} path="/debug" component={Debug} />
        {
          this.state.user &&
          <Student student={this.state.user} />
        }
      </Container>
    );
  }
  private login() {
    return <Login setAuth={this.setAuth} />;
  }
  private logout(ev: FormEvent<any>) {
    this.setState({ user: null });
    setAuth(null);
  }
  private setAuth(token: string): void {
    this.setState({ user: userDecode(token) });
  }
  private toggleMenu(ev: FormEvent<any>) {
    this.setState(oldState => ({menuActive: !oldState.menuActive}));
  }
}

export default withRouter(App);
