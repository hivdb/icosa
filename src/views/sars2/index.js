import React, {Suspense, lazy} from 'react';
import {Route, Redirect} from 'found';
import makeClassNames from 'classnames';
import Loader from 'react-loader';

import style from './style.module.scss';
import defaultConfig from './config';

import ConfigContext, {
  configWrapper
} from '../../components/report/config-context';
import CustomColors from '../../components/custom-colors';

const SeqAnaForms = lazy(() => import('./forms'));
const ReportBySequences = lazy(() => import('./report-by-sequences'));
const ReportBySeqReads = lazy(() => import('./report-by-reads'));


export default function SARS2Routes({
  pathPrefix = "sars2/",
  config = {},
  formProps,
  colors,
  className
} = {}) {
  const configContext = configWrapper({...defaultConfig, ...config});
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

  function wrapper({children}) {
    return <Suspense fallback={<Loader loaded={false} />}>
      <CustomColors className={wrapperClassName} colors={colors}>
        <ConfigContext.Provider value={configContext}>
          {children}
        </ConfigContext.Provider>
      </CustomColors>
    </Suspense>;
  }
}
