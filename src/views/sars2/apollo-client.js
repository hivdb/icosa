import {
  ApolloClient,
  InMemoryCache,
  HttpLink
} from '@apollo/client';
// import {Hermes} from 'apollo-cache-hermes';
// import {HttpLink} from 'apollo-link-http';
import defaultConfig from './config';

import {
  configWrapper
} from '../../components/report/config-context';


export default function buildClient({
  pathPrefix = "sars2/",
  config = {},
  formProps,
  colors,
  className
} = {}) {
  // avoid using ApolloProvider, instead providing a fresh client
  // to SequenceAnalysisLayout at each time. The cache can be very
  // tricky to handle when making multiple independent queries.
  const configContext = configWrapper({...defaultConfig, ...config});
  const apolloClient = new ApolloClient({
    link: new HttpLink({
      uri: configContext.graphqlURI
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
