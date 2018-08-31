import {
  Box,
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
  Switch,
  withRouter,
} from 'react-router-dom';

import 'bulma/css/bulma.css';
import './app.css';
import './normalise.css';

import { getAuth, setAuth } from './client';
import Classes from './components/Classes';
import Debug from './components/Debug';
import Import from './components/Import';
import Login from './components/Login';
import NaiveTimetable from './components/NaiveTimetable';
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

    this.classes = this.classes.bind(this);
    this.timetables = this.timetables.bind(this);
    this.importComp = this.importComp.bind(this);
    this.root = this.root.bind(this);
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
                    <Link to="/classes">Classes</Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link to="/timetables">Timetables</Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link to="/debug">Debug</Link>
                  </NavbarItem>
                  <NavbarItem>
                    <Link to="/import">Import</Link>
                  </NavbarItem>
                </>
              ) : null}
            </NavbarStart>
            <NavbarEnd>
              {this.state.user && (
                <>
                  <NavbarItem>
                    Hi {this.state.user.name}
                  </NavbarItem>
                  <NavbarItem>
                    <Button onClick={this.logout}>Logout</Button>
                  </NavbarItem>
                </>
              )}
            </NavbarEnd>
          </NavbarMenu>
        </Navbar>

        <br/>

        <Box>
          <Switch>
            <Route exact={true} path="/login" render={this.login} />
            <Route exact={true} path="/debug" component={Debug} />
            {
              this.state.user &&
              <>
                <Route exact={true} path="/classes" render={this.classes} />
                <Route exact={true} path="/timetables" render={this.timetables} />
                <Route exact={true} path="/import" render={this.importComp} />
                <Route exact={true} path="/" render={this.root} />
              </>
            }
          </Switch>
        </Box>
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
  private classes() {
    return <Classes student={this.state.user} />;
  }
  private timetables() {
    return this.state.user && <NaiveTimetable student={this.state.user} />;
  }
  private importComp() {
    return <Import student={this.state.user} />;
  }
  private root() {
    return <Redirect to="/classes" />;
  }
}

export default withRouter(App);
