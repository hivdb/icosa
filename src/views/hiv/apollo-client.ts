import React from 'react';
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
 * Build a dedicated Apollo client instance.
 *
 * @param config - Runtime configuration containing the GraphQL URI.
 * @returns A freshly constructed {@link ApolloClient} instance.
 */
function buildClient(config: { graphqlURI: string }): ApolloClient<any> {
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
              // Merge results by sequence header to avoid duplicates.
              merge: (existing: any[] = [], incoming: any[]) => {
                const merged: Record<string, any> = {};
                for (const seq of [...existing, ...incoming]) {
                  const { inputSequence: { header } } = seq;
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

interface UseApolloClientArgs {
  /** Runtime configuration */
  config: { graphqlURI: string };
  /** Skip client creation */
  skip?: boolean;
  /** Payload to determine cache reuse */
  payload: unknown;
}

/**
 * React hook returning an Apollo client instance. The client is re-created
 * whenever the provided payload changes.
 *
 * @param args - {@link UseApolloClientArgs}
 * @returns The memoised Apollo client or `null` when `skip` is true.
 */
export default function useApolloClient({
  config,
  skip = false,
  payload
}: UseApolloClientArgs): ApolloClient<any> | null {
  const { current } = React.useRef<{ client?: ApolloClient<any>; payload?: unknown }>({});
  if (skip) {
    return null;
  }

  if (!current.client || !isEqual(current.payload, payload)) {
    current.client = buildClient(config);
    current.payload = payload;
  }

  return current.client ?? null;
}
