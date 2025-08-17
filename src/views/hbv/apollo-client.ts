import React from 'react';
import isEqual from 'lodash/isEqual';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client';

function buildClient(config: any): ApolloClient<any> {
  // avoid using ApolloProvider, instead providing a fresh client
  // to SequenceAnalysisLayout at each time. The cache can be very
  // tricky to handle when making multiple independent queries.
  const apolloClient = new ApolloClient({
    link: new HttpLink({uri: config.graphqlURI}),
    cache: new InMemoryCache({
      typePolicies: {
        Root: {
          queryType: true,
          fields: {
            sequenceAnalysis: {
              keyArgs: false,
              merge: (existing = [], incoming) => {
                const merged = {} as Record<string, any>;
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

interface UseApolloClientOptions {
  config: any;
  skip?: boolean;
  payload: any;
}

/**
 * Build and cache an Apollo client for HBV queries.
 *
 * @param options - {@link UseApolloClientOptions} including payload and config.
 * @returns ApolloClient instance or null when skipped.
 */
export default function useApolloClient({
  config,
  skip = false,
  payload
}: UseApolloClientOptions): ApolloClient<any> | null {
  const {current} = React.useRef<{client?: ApolloClient<any>; payload?: any}>({});
  if (skip) {
    return null;
  }

  if (!current.client || !isEqual(current.payload, payload)) {
    current.client = buildClient(config);
    current.payload = payload;
  }

  return current.client as ApolloClient<any>;
}

