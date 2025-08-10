import React from 'react';
import isEqual from 'lodash/isEqual';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client';
// import {Hermes} from 'apollo-cache-hermes';
// import {HttpLink} from 'apollo-link-http';


/**
 * Construct a new Apollo client instance for EBV queries.
 *
 * @param config - Runtime configuration containing the GraphQL URI.
 * @returns A freshly created {@link ApolloClient} instance.
 */
function buildClient(config: any): ApolloClient<any> {
  // Avoid using ApolloProvider, instead providing a fresh client
  // to SequenceAnalysisLayout each time. The cache can be very
  // tricky to handle when making multiple independent queries.
  const apolloClient = new ApolloClient({
    link: new HttpLink({uri: config.graphqlURI}),
    // cache: new Hermes(),
    cache: new InMemoryCache({
      typePolicies: {
        Root: {
          queryType: true,
          fields: {
            sequenceAnalysis: {
              keyArgs: false,
              merge: (existing = [], incoming) => {
                const merged: Record<string, unknown> = {};
                for (const seq of [...existing, ...incoming]) {
                  const { inputSequence: { header } } = seq as any;
                  merged[header as string] = seq;
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
 * Build and cache an Apollo client for EBV queries.
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
