import React, {Suspense, lazy} from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'found';
import makeClassNames from 'classnames';
import Loader from '../../components/loader';

import style from './style.module.scss';
import defaultConfig from './config';

import ConfigContext, {
  useConfigLoader
} from '../../utils/config-context';
import CustomColors from '../../components/custom-colors';

import HBVRefDataLoader from './ref-data-loader';
const SeqAnaForms = lazy(() => import('./forms'));
const ReportByPatterns = lazy(() => import('./report-by-patterns'));
const ReportBySequences = lazy(() => import('./report-by-sequences'));
const ReportBySeqReads = lazy(() => import('./report-by-reads'));


Layout.propTypes = {
  data: PropTypes.shape({
    defaultConfig: PropTypes.object.isRequired,
    config: PropTypes.object,
    className: PropTypes.string,
    colors: PropTypes.object
  }),
  children: PropTypes.node
};


function Layout({
  children,
  data: {
    defaultConfig,
    config,
    className,
    colors
  }
}) {
  const combinedConfig = React.useMemo(
    () => ({
      ...defaultConfig,
      ...config,
      refDataLoader: HBVRefDataLoader
    }),
    [defaultConfig, config]
  );
  const configContextLoader = useConfigLoader(combinedConfig);
  const layoutClassName = makeClassNames(style['sierra-webui'], className);
  return <Suspense fallback={<Loader />}>
    <CustomColors className={layoutClassName} colors={colors}>
      <ConfigContext.Provider value={configContextLoader}>
        {children}
      </ConfigContext.Provider>
    </CustomColors>
  </Suspense>;
}


export default function hbvRoutes({
  pathPrefix = "hbv/",
  defaultForm = "by-patterns/",
  config = {},
  formProps,
  colors,
  className
} = {}) {

  return <Route
   path={pathPrefix}
   data={{defaultConfig, config, className, colors}}
   Component={Layout}>
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
    <Route
     path="ngs2codfreq/"
     render={({props}) => (
       <SeqAnaForms
        {...props} {...formProps}
        pathPrefix={pathPrefix}
        curAnalysis="ngs2codfreq" />
     )} />
    <Redirect to={({location: {pathname}}) => (
      `${pathname}${pathname.endsWith('/') ? '' : '/'}${defaultForm}`
    )} />
    <Redirect
     from="by-mutations/"
     to={({location: {pathname}}) => (
       pathname.replace(/by-mutations\/?$/, 'by-patterns/')
     )} />
  </Route>;
}
