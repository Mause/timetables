import gql from 'graphql-tag';
import * as React from 'react';
import { Component } from 'react';
import { Query } from 'react-apollo';
import renderError from './renderError';

class Debug extends Component<{}, {}, {}> {
  public render() {
    return (
      <Query
        query={gql`
          query DebugQuery {
            students {
              timetables {
                id
                days {
                  id
                  index
                  classes {
                    class {
                      name
                    }
                    start
                    end
                    location
                  }
                }
              }
            }
          }
        `}
      >
        {({ data, loading, error }) => renderError({ data, loading, error })}
      </Query>
    );
  }
}

export default Debug;
