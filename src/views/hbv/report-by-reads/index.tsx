import React from 'react';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsLoader, {useWhenNoSeqReads} from '../../../components/seqreads-loader';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';

import query from './query.graphql';
import SeqReadsReports from './reports';

interface ReportByReadsContainerProps {
  config?: Record<string, any>;
  router: any;
  match: any;
  lazyLoad: boolean;
  output?: string;
  allSequenceReads: any[];
  currentSelected?: any;
}

/**
 * Render sequence read analysis reports.
 *
 * @param props - {@link ReportByReadsContainerProps} configuration.
 * @returns Rendered layout for sequence read reports.
 */
function ReportByReadsContainer({
  config,
  router,
  match,
  lazyLoad,
  output,
  allSequenceReads,
  currentSelected
}: ReportByReadsContainerProps): JSX.Element {
  const client = useApolloClient({
    payload: allSequenceReads,
    config
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });

  return <SeqReadsAnalysisLayout
   query={query}
   client={client}
   allSequenceReads={allSequenceReads}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams={`
     $includeGenes: [EnumGene!]!
   `}
   onExtendVariables={onExtendVariables}>
    {props => (
      <SeqReadsReports
       cmtVersion={config.cmtVersion}
       output={output}
       match={match}
       router={router}
       {...props} />
    )}
  </SeqReadsAnalysisLayout>;

}

interface WrapperProps {
  router: any;
  match: any;
}

/**
 * Wrapper to load configuration and sequence reads before rendering.
 *
 * @param props - {@link WrapperProps} with routing information.
 * @returns The reads report container.
 */
export default function ReportByReadsContainerWrapper(props: WrapperProps): JSX.Element {
  const {
    location: {
      pathname,
      query: {output = 'default'} = {},
    } = {},
  } = props.match;
  const lazyLoad = output !== 'printable';

  useWhenNoSeqReads(() => props.router.replace({
    pathname: pathname.replace(/report\/*$/, '')
  }));

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqReadsLoader lazyLoad={lazyLoad}>
          {({allSequenceReads, currentSelected}) => (
            <ReportByReadsContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             allSequenceReads={allSequenceReads}
             currentSelected={currentSelected}
             config={config} />
          )}
        </SeqReadsLoader>
      )}
    </ConfigContext.Consumer>
  );
}

