import {
  Container,
  Navbar,
  NavbarItem,
  NavbarMenu,
  NavbarStart,
  Title,
} from 'bloomer';
import * as React from 'react';
import { Link, Route, RouteComponentProps, withRouter } from 'react-router-dom';

import 'bulma/css/bulma.css';
import './app.css';
import './normalise.css';

import Debug from './components/Debug';
import Login from './components/Login';
import Student from './components/Student';

interface IAppProps extends RouteComponentProps<{}, {}, { userId: string | undefined }> {
}
interface IAppState {
  userId: string | undefined;
}

class App extends React.Component<IAppProps, IAppState, {}> {
  constructor(props: IAppProps) {
    super(props);
    if (props.location.state && props.location.state.userId) {
      this.state = { userId: props.location.state.userId };
    } else {
      this.state = { userId: undefined };
    }
  }
  public render() {
    return (
      <Container className="app">
        <Title>Timetables</Title>

        <Navbar>
          <NavbarMenu>
            <NavbarStart>
              {this.state.userId ? (
                <div>
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
                </div>
              ) : null}
            </NavbarStart>
          </NavbarMenu>
        </Navbar>

        <Route exact={true} path="/login" component={Login} />
        <Route exact={true} path="/debug" component={Debug} />
        <Student />
      </Container>
    );
  }
}

export default withRouter(App);
