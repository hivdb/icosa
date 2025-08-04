import React, {lazy, Suspense, ReactNode} from 'react';
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
  /** Child nodes rendered inside the layout. */
  children: ReactNode;
  /** Route data including configuration and styling. */
  data: {
    defaultConfig: Record<string, unknown>;
    config?: Record<string, unknown>;
    className?: string;
    colors?: Record<string, string>;
  };
}

/**
 * Layout component wrapping HBV views with configuration and styles.
 *
 * @param props - {@link LayoutProps} to configure the layout.
 * @returns Rendered layout container.
 */
function Layout({
  children,
  data: {defaultConfig, config, className, colors}
}: LayoutProps): JSX.Element {
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

interface HbvRoutesOptions {
  pathPrefix?: string;
  defaultForm?: string;
  config?: Record<string, unknown>;
  formProps?: Record<string, unknown>;
  colors?: Record<string, string>;
  className?: string;
}

/**
 * Generate the HBV route subtree.
 *
 * @param options - {@link HbvRoutesOptions} for path and configuration.
 * @returns A {@link Route} element describing HBV routes.
 */
export default function hbvRoutes({
  pathPrefix = 'hbv/',
  defaultForm = 'by-patterns/',
  config = {},
  formProps,
  colors,
  className
}: HbvRoutesOptions = {}): JSX.Element {
  return <Route
   path={pathPrefix}
   data={{defaultConfig, config, className, colors}}
   Component={Layout}>
    <Route path="by-patterns/">
      <Route render={({props}: any) => (
        <SeqAnaForms
         {...props} {...formProps}
         pathPrefix={pathPrefix}
         curAnalysis="pattern-analysis" />
      )}/>
      <Route path="report/" Component={ReportByPatterns} />
    </Route>
    <Route path="by-sequences/">
      <Route render={({props}: any) => (
        <SeqAnaForms
         {...props} {...formProps}
         pathPrefix={pathPrefix}
         curAnalysis="sequence-analysis" />
      )}/>
      <Route path="report/" Component={ReportBySequences} />
    </Route>
    <Route path="by-reads/">
      <Route render={({props}: any) => (
        <SeqAnaForms
         {...props} {...formProps}
         pathPrefix={pathPrefix}
         curAnalysis="seqreads-analysis" />
      )}/>
      <Route path="report/" Component={ReportBySeqReads} />
    </Route>
    <Route
     path="ngs2codfreq/"
     render={({props}: any) => (
       <SeqAnaForms
        {...props} {...formProps}
        pathPrefix={pathPrefix}
        curAnalysis="ngs2codfreq" />
     )} />
    <Redirect to={({location: {pathname}}: any) => (
      `${pathname}${pathname.endsWith('/') ? '' : '/'}${defaultForm}`
    )} />
    <Redirect
     from="by-mutations/"
     to={({location: {pathname}}: any) => (
       pathname.replace(/by-mutations\/?$/, 'by-patterns/')
     )} />
  </Route>;
}

