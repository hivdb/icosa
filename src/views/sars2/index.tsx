import React, {Suspense, lazy} from 'react';
import {Route, Redirect} from 'found';
import makeClassNames from 'classnames';
import Loader from '../../components/loader';

import style from './style.module.scss';
import defaultConfig from './config';

import ConfigContext, {
  useConfigLoader
} from '../../utils/config-context';
import CustomColors from '../../components/custom-colors';

const SeqAnaForms = lazy(() => import('./forms'));
const ReportByPatterns = lazy(() => import('./report-by-patterns'));
const ReportBySequences = lazy(() => import('./report-by-sequences'));
const ReportBySeqReads = lazy(() => import('./report-by-reads'));


interface LayoutProps {
  /**
   * Nested React nodes to render inside the layout.
   */
  children: React.ReactNode;
  /**
   * Configuration values used to initialize the layout.
   */
  data: {
    /** Default configuration shipped with the application. */
    defaultConfig: Record<string, any>;
    /** Optional runtime configuration overrides. */
    config?: Record<string, any>;
    /** Optional class name for the root element. */
    className?: string;
    /** Optional custom color palette. */
    colors?: Record<string, string>;
  };
}

function Layout({
  children,
  data: {
    defaultConfig,
    config = {},
    className,
    colors
  }
}: LayoutProps) {
  const combinedConfig = React.useMemo(
    () => ({...defaultConfig, ...config}),
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


/**
 * Build the Found router configuration for SARS-CoV-2 analysis pages.
 *
 * @param options Optional routing and configuration settings.
 * @param options.pathPrefix Base path where the routes are mounted.
 * @param options.defaultForm The default form path to redirect to.
 * @param options.config Additional configuration overrides.
 * @param options.formProps Extra properties passed to the form components.
 * @param options.colors Optional color palette for `CustomColors`.
 * @param options.className Additional class name for the layout root.
 * @returns A `<Route>` element describing the analysis routes.
 */
export default function sars2Routes({
  pathPrefix = "sars2/",
  defaultForm = "by-patterns/",
  config = {},
  formProps,
  colors,
  className
}: {
  pathPrefix?: string;
  defaultForm?: string;
  config?: Record<string, any>;
  formProps?: Record<string, any>;
  colors?: Record<string, string>;
  className?: string;
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
