import {ApolloClient} from 'apollo-client';
import {Hermes} from 'apollo-cache-hermes';
import {HttpLink} from 'apollo-link-http';

import config from './config';


export default new ApolloClient({
  link: new HttpLink({uri: config.graphql_url}),
  cache: new Hermes(),
  name: 'sierra-frontend-client',
  version: '0.1'
});
