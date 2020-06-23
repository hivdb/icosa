import React from 'react';
import {Route, Redirect} from 'found';
import {ApolloProvider} from 'react-apollo';
import {ApolloClient} from 'apollo-client';
import {Hermes} from 'apollo-cache-hermes';
import {HttpLink} from 'apollo-link-http';

import SeqAnaForms from './forms';
import ReportBySequences from './report-by-sequences';
import ReportBySeqReads from './report-by-reads';
import config from './config';


export default function SARS2Routes({
  pathPrefix,
  species,
  graphqlURI
} = {
  pathPrefix: "sars2/",
  species: "SARS2",
  graphqlURI: config.graphqlURI
}) {
  const apolloClient = new ApolloClient({
    link: new HttpLink({uri: config.graphqlURI}),
    cache: new Hermes(),
    name: 'sierra-frontend-client',
    version: '0.1'
  });
  return <>
    <Redirect from={pathPrefix} to={`${pathPrefix}by-sequences/`} />
    <Route path={pathPrefix} render={({props}) => (
      <ApolloProvider {...props} client={apolloClient} />
    )}>
      <Route path="by-sequences/">
        <Route render={({props}) => (
          <SeqAnaForms {...props} species={species} />
        )}/>
        <Route path="report/" render={({props}) => (
          <ReportBySequences {...props} species={species} />
        )}/>
      </Route>
      <Route path="by-reads/">
        <Route render={({props}) => (
          <SeqAnaForms {...props} species={species} />
        )}/>
        <Route path="report/" render={({props}) => (
          <ReportBySeqReads {...props} species={species} />
        )}/>
      </Route>
    </Route>
  </>;
}
