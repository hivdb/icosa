import React from 'react';
import isEqual from 'lodash/isEqual';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client';
// import {Hermes} from 'apollo-cache-hermes';
// import {HttpLink} from 'apollo-link-http';


function buildClient(config) {
  // avoid using ApolloProvider, instead providing a fresh client
  // to SequenceAnalysisLayout at each time. The cache can be very
  // tricky to handle when making multiple independent queries.
  const apolloClient = new ApolloClient({
    link: new HttpLink({
      uri: config.graphqlURI
    }),
    // cache: new Hermes(),
    cache: new InMemoryCache({
      typePolicies: {
        Root: {
          queryType: true,
          fields: {
            sequenceAnalysis: {
              keyArgs: false,
              merge: (existing = [], incoming) => {
                const merged = {};
                for (const seq of [...existing, ...incoming]) {
                  const {inputSequence: {header}} = seq;
                  merged[header] = seq;
                }
                return Array.from(Object.values(merged));
              }
            }
          }
        }
      }
    }),
    name: 'sierra-frontend-client',
    version: '0.1'
  });
  return apolloClient;
}


export default function useApolloClient({
  config,
  skip = false,
  payload
}) {
  const {current} = React.useRef({});
  if (skip) {
    return null;
  }

  if (!current.client || !isEqual(current.payload, payload)) {
    current.client = buildClient(config);
    current.payload = payload;
  }

  return current.client;
}
