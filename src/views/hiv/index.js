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
const ReportByPatterns = lazy(() => import('./report-by-patterns'));
const ReportBySequences = lazy(() => import('./report-by-sequences'));
const ReportBySeqReads = lazy(() => import('./report-by-reads'));


export default function HIV1Routes({
  pathPrefix = "hiv/",
  config = {},
  formProps,
  colors,
  className
} = {}) {
  const configContext = configWrapper({...defaultConfig, ...config});
  const wrapperClassName = makeClassNames(style['sierra-webui'], className);

  return <Route path={pathPrefix} Component={wrapper}>
    <Route path="by-patterns/">
      <Route render={({props}) => (
        <SeqAnaForms
         {...props} {...formProps}
         pathPrefix={pathPrefix}
         curAnalysis="pattern-analysis" />
      )}/>
      <Route path="report/" Component={ReportByPatterns} />
    </Route>
    <Route path="by-sequences/">
      <Route render={({props}) => (
        <SeqAnaForms
         {...props} {...formProps}
         pathPrefix={pathPrefix}
         curAnalysis="sequence-analysis" />
      )}/>
      <Route path="report/" Component={ReportBySequences} />
    </Route>
    <Route path="by-reads/">
      <Route render={({props}) => (
        <SeqAnaForms
         {...props} {...formProps}
         pathPrefix={pathPrefix}
         curAnalysis="seqreads-analysis" />
      )}/>
      <Route path="report/" Component={ReportBySeqReads} />
    </Route>
    <Route path="ngs2codfreq/" render={({props}) => (
      <SeqAnaForms
       {...props} {...formProps}
       pathPrefix={pathPrefix}
       curAnalysis="ngs2codfreq" />
    )} />
    <Redirect to={({location: {pathname}}) => (
      `${pathname}${pathname.endsWith('/') ? '' : '/'}by-patterns/`
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
