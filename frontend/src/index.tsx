import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App';
import client from './client';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <Router>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Router>,
  document.getElementById('root') as HTMLElement,
);
registerServiceWorker();
