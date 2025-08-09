import React, {ReactElement} from 'react';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import PatternLoader from '../../../components/pattern-loader';
import PatternAnalysisLayout from
  '../../../components/pattern-analysis-layout';

import query from './query.graphql';
import PatternReports from './reports';

interface ReportByPatternsContainerProps {
  config?: Record<string, any>;
  router: any;
  match: any;
  lazyLoad: boolean;
  output?: string;
  isPending: boolean;
  patterns: any[];
  currentSelected?: any;
}

/**
 * Render pattern analysis reports for HBV.
 *
 * @param props - {@link ReportByPatternsContainerProps} for configuration.
 * @returns Rendered pattern analysis layout.
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
}: ReportByPatternsContainerProps): ReactElement | null {

  if (!isPending && patterns.length === 0) {
    router.replace({
      pathname: match.location.pathname.replace(/report\/*$/, '')
    });
  }

  if (!config) {
    return null;
  }

  const client = useApolloClient({
    payload: patterns,
    config
  });
  const onExtendVariables = useExtendVariables({
    config: config as {allGenes: string[]}
  });
  return <PatternAnalysisLayout
   query={query}
   client={client}
   patterns={patterns}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   onExtendVariables={onExtendVariables}>
    {props => (
      <PatternReports
       output={output}
       router={router}
       cmtVersion={config.cmtVersion}
       {...props} />
    )}
  </PatternAnalysisLayout>;

}

interface WrapperProps {
  match: any;
  router: any;
}

/**
 * Wrapper component loading configuration and patterns before rendering.
 *
 * @param props - {@link WrapperProps} containing routing information.
 * @returns The fully configured pattern report container.
 */
export default function ReportByPatternsContainerWrapper(props: WrapperProps): ReactElement {
  const {
    location: {
      query: {output = 'default'} = {}
    } = {},
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

