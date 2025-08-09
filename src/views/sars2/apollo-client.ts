import React from 'react';
import isEqual from 'lodash/isEqual';
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject
} from '@apollo/client';
// import {Hermes} from 'apollo-cache-hermes';
// import {HttpLink} from 'apollo-link-http';


interface BuildClientConfig {
  /** GraphQL endpoint used by the Apollo client. */
  graphqlURI: string;
}

/**
 * Create a new instance of `ApolloClient` with the project specific cache
 * configuration. A fresh client is preferred for each analysis run to avoid
 * dealing with complex cache invalidation logic.
 */
function buildClient(config: BuildClientConfig): ApolloClient<NormalizedCacheObject> {
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

interface UseApolloClientArgs {
  /** Apollo client configuration. */
  config: BuildClientConfig;
  /** Skip creating the client when set to true. */
  skip?: boolean;
  /**
   * Payload data used to determine if a new client is required. When the
   * payload changes a fresh client is created to ensure cache isolation.
   */
  payload?: unknown;
}

/**
 * React hook returning a memoised `ApolloClient` instance for SARS-CoV-2
 * analysis requests.
 *
 * @param args Hook arguments controlling client creation.
 * @returns An `ApolloClient` instance or `null` when `skip` is `true`.
 */
export default function useApolloClient({
  config,
  skip = false,
  payload
}: UseApolloClientArgs): ApolloClient<NormalizedCacheObject> | null {
  const {current} = React.useRef<{client?: ApolloClient<NormalizedCacheObject>; payload?: unknown}>({});
  if (skip) {
    return null;
  }

  if (!current.client || !isEqual(current.payload, payload)) {
    current.client = buildClient(config);
    current.payload = payload;
  }

  return current.client!;
}
