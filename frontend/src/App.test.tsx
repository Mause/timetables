import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { StaticRouter } from 'react-router-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const el = <StaticRouter context={{}}><App /></StaticRouter>;
  ReactDOM.render( el, div);
  ReactDOM.unmountComponentAtNode(div);
});
