import React from 'react';
import type {Match, Router} from 'found';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import PatternLoader from '../../../components/pattern-loader';
import PatternAnalysisLayout from
  '../../../components/pattern-analysis-layout';

import query from './query.graphql';
import PatternReports from './reports';

interface ReportByPatternsContainerProps {
  config: any;
  lazyLoad: boolean;
  output?: string;
  match: Match;
  router: Router;
  isPending: boolean;
  patterns: any[];
  currentSelected?: any;
}

/**
 * Internal container that fetches data and renders pattern analysis reports.
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
}: ReportByPatternsContainerProps) {

  if (!isPending && patterns.length === 0) {
    router.replace({
      pathname: match.location.pathname.replace(/report[/]*$/, '')
    });
  }

  const client = useApolloClient({
    payload: patterns,
    config
  });
  const [onExtendVariables, isVarsPending] = useExtendVariables({
    config
  });
  return isVarsPending ? null : <PatternAnalysisLayout
   query={query}
   client={client}
   patterns={patterns}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams={`
     $includeGenes: [EnumGene!]!,
     $algorithms: [ASIAlgorithm!],
     $customAlgorithms: [CustomASIAlgorithm!]
   `}
   onExtendVariables={onExtendVariables}>
    {props => (
      <PatternReports
       config={config}
       output={output}
       {...props} />
    )}
  </PatternAnalysisLayout>;

}

interface WrapperProps {
  match: Match;
  router: Router;
}

/**
 * Wrapper component that loads configuration and pattern data before rendering
 * the actual report container.
 */
export default function ReportByPatternsContainerWrapper(props: WrapperProps) {
  const {
    location: {
      query: {output: outputParam = 'default'} = {}
    } = {}
  } = props.match;
  const output = Array.isArray(outputParam) ? outputParam[0] : outputParam;
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
