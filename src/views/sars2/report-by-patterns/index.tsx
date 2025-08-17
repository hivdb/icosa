import React from 'react';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import PatternLoader from '../../../components/pattern-loader';
import PatternAnalysisLayout from
  '../../../components/pattern-analysis-layout';

import query from './query.graphql';
import PatternReports from './reports';

interface ReportByPatternsContainerProps {
  /** Configuration object. */
  config: Record<string, any>;
  /** Lazy load results. */
  lazyLoad: boolean;
  /** Output mode. */
  output?: string;
  /** Route match object. */
  match: any;
  /** Router instance. */
  router?: any;
  /** Whether data is still pending. */
  isPending: boolean;
  /** List of mutation patterns. */
  patterns: any[];
  /** Currently selected pattern. */
  currentSelected?: any;
}

/**
 * Render pattern analysis reports.
 */
function ReportByPatternsContainer({
  config,
  router,
  match,
  lazyLoad,
  output,
  isPending,
  patterns,
  currentSelected
}: ReportByPatternsContainerProps): React.ReactElement {

  if (!isPending && patterns.length === 0) {
    router?.replace({
      pathname: match.location.pathname.replace(/report\/*$/, '')
    });
  }

  const client = useApolloClient({
    payload: patterns,
    config: config as any
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });
  return <PatternAnalysisLayout
   query={query}
   client={client}
   patterns={patterns}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams="$drdbVersion: String!, $cmtVersion: String!"
   onExtendVariables={onExtendVariables}>
    {props => (
      <PatternReports
       output={output}
       match={match}
       router={router}
       cmtVersion={config?.cmtVersion}
       {...props} />
    )}
  </PatternAnalysisLayout>;

}

interface WrapperProps {
  /** Route match object. */
  match: any;
  /** Router instance. */
  router?: any;
}

/**
 * Wrapper component that loads configuration and patterns before rendering.
 */
export default function ReportByPatternsContainerWrapper(props: WrapperProps): React.ReactElement {
  const {
    location: {
      query: {output = 'default'} = {}
    } = {}
  } = props.match;
  const lazyLoad = output !== 'printable';
  return (
    <ConfigContext.Consumer>
      {config => (
        <PatternLoader lazyLoad={lazyLoad}>
          {({patterns, isPending, currentSelected}) => (
            <ReportByPatternsContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             isPending={isPending}
             patterns={patterns}
             currentSelected={currentSelected}
             config={config} />
          )}
        </PatternLoader>
      )}
    </ConfigContext.Consumer>
  );
}

