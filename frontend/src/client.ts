import ApolloClient from 'apollo-boost';
import { Operation } from 'apollo-link';
// import { persistCache } from 'apollo-cache-persist';

const client = new ApolloClient({
  uri: process.env.API_ENDPOINT || 'http://localhost:5000/graphql',
  async request(operation: Operation): Promise<any> {
    operation.setContext({
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
  }
});

// persistCache({
//   cache: client.cache,
//   debug: true,
//   storage: window.localStorage,
// });

let token: string | undefined;

export function setAuth(inToken: string) {
  token = inToken;
}

export default client;
