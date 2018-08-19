import ApolloClient from 'apollo-boost';
import { persistCache } from 'apollo-cache-persist';
import { Operation } from 'apollo-link';

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_ENDPOINT,
  async request(operation: Operation): Promise<any> {
    operation.setContext({
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  persistCache({
    cache: client.cache,
    debug: true,
    storage: window.localStorage,
  });
}

let token: string | undefined;

export function setAuth(inToken: string) {
  token = inToken;
}

export default client;
