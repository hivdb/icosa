import React, { Suspense, lazy } from 'react';
import { Route, Redirect } from 'found';
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
  /** React children */
  children?: React.ReactNode;
  /** Data injected by the router */
  data: {
    defaultConfig: Record<string, any>;
    config?: Record<string, any>;
    className?: string;
    colors?: Record<string, string>;
  };
}

function Layout({
  children,
  data: {
    defaultConfig,
    config,
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

interface HIV1RoutesArgs {
  /** Prefix appended to generated paths */
  pathPrefix?: string;
  /** Default form path */
  defaultForm?: string;
  /** Custom configuration overrides */
  config?: Record<string, any>;
  /** Additional properties passed to sequence analysis forms */
  formProps?: Record<string, any>;
  /** CSS color variables */
  colors?: Record<string, string>;
  /** Additional class name for root element */
  className?: string;
}

/**
 * Generate the Found router configuration for HIV1 views.
 */
export default function hiv1Routes({
  pathPrefix = 'hiv/',
  defaultForm = 'by-patterns/',
  config = {},
  formProps,
  colors,
  className
}: HIV1RoutesArgs = {}): JSX.Element {
  return (
    <Route
      path={pathPrefix}
      data={{ defaultConfig, config, className, colors }}
      Component={Layout}
    >
      <Route path="by-patterns/">
        <Route
          render={({ props }) => (
            <SeqAnaForms
              {...props}
              {...formProps}
              pathPrefix={pathPrefix}
              curAnalysis="pattern-analysis"
            />
          )}
        />
        <Route path="report/" Component={ReportByPatterns} />
      </Route>
      <Route path="by-sequences/">
        <Route
          render={({ props }) => (
            <SeqAnaForms
              {...props}
              {...formProps}
              pathPrefix={pathPrefix}
              curAnalysis="sequence-analysis"
            />
          )}
        />
        <Route path="report/" Component={ReportBySequences} />
      </Route>
      <Route path="by-reads/">
        <Route
          render={({ props }) => (
            <SeqAnaForms
              {...props}
              {...formProps}
              pathPrefix={pathPrefix}
              curAnalysis="seqreads-analysis"
            />
          )}
        />
        <Route path="report/" Component={ReportBySeqReads} />
      </Route>
      <Route
        path="ngs2codfreq/"
        render={({ props }) => (
          <SeqAnaForms
            {...props}
            {...formProps}
            pathPrefix={pathPrefix}
            curAnalysis="ngs2codfreq"
          />
        )}
      />
      <Redirect
        to={({ location: { pathname } }) =>
          `${pathname}${pathname.endsWith('/') ? '' : '/'}${defaultForm}`
        }
      />
      <Redirect
        from="by-mutations/"
        to={({ location: { pathname } }) =>
          pathname.replace(/by-mutations\/?$/, 'by-patterns/')
        }
      />
    </Route>
  );
}
