import React from 'react';
import {Route, Redirect} from 'found';
import {ApolloProvider} from 'react-apollo';
import {ApolloClient} from 'apollo-client';
import {Hermes} from 'apollo-cache-hermes';
import {HttpLink} from 'apollo-link-http';
import makeClassNames from 'classnames';

import SeqAnaForms from './forms';
import ReportBySequences from './report-by-sequences';
import ReportBySeqReads from './report-by-reads';
import style from './style.module.scss';
import defaultConfig from './config';

import ConfigContext, {
  configWrapper
} from '../../components/report/config-context';
import CustomColors from '../../components/custom-colors';


export default function SARS2Routes({
  pathPrefix = "sars2/",
  config = {},
  formProps,
  colors,
  className
} = {}) {
  const configContext = configWrapper({...defaultConfig, ...config});
  const apolloClient = new ApolloClient({
    link: new HttpLink({uri: configContext.graphqlURI}),
    cache: new Hermes(),
    name: 'sierra-frontend-client',
    version: '0.1'
  });
  const species = configContext.species;
  const wrapperClassName = makeClassNames(style['sierra-webui'], className);

  return <Route path={pathPrefix} Component={wrapper}>
    <Route path="by-sequences/">
      <Route render={({props}) => (
        <SeqAnaForms {...props} {...formProps} {...{species, pathPrefix}} />
      )}/>
      <Route path="report/" render={({props}) => (
        <ReportBySequences {...props} species={species} />
      )}/>
    </Route>
    <Route path="by-reads/">
      <Route render={({props}) => (
        <SeqAnaForms {...props} {...formProps} {...{species, pathPrefix}} />
      )}/>
      <Route path="report/" render={({props}) => (
        <ReportBySeqReads {...props} species={species} />
      )}/>
    </Route>
    <Redirect to={({location: {pathname}}) => (
      `${pathname}${pathname.endsWith('/') ? '' : '/'}by-sequences/`
    )} />
  </Route>;

  function wrapper(props) {
    return <CustomColors className={wrapperClassName} colors={colors}>
      <ConfigContext.Provider value={configContext}>
        <ApolloProvider {...props} client={apolloClient} />
      </ConfigContext.Provider>
    </CustomColors>;
  }
}
