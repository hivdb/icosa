import React from 'react';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsLoader, {
  useWhenNoSeqReads
} from '../../../components/seqreads-loader';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';

import query from './query.graphql';
import SeqReadsReports from './reports';

interface ReportByReadsContainerProps {
  config?: any;
  router: { replace: (loc: any) => void };
  match: any;
  lazyLoad: boolean;
  output?: string;
  allSequenceReads: any[];
  currentSelected?: any;
}

function ReportByReadsContainer({
  config,
  router,
  match,
  lazyLoad,
  output,
  allSequenceReads,
  currentSelected
}: ReportByReadsContainerProps) {
  const client = useApolloClient({
    payload: allSequenceReads,
    config
  });
  const [onExtendVariables, isVarsPending] = useExtendVariables({
    config
  });

  return isVarsPending ? null : <SeqReadsAnalysisLayout
   query={query}
   client={client}
   quickLoadLimit={5}
   maxPerRequest={2}
   allSequenceReads={allSequenceReads}
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
      <SeqReadsReports
       config={config}
       output={output}
       match={match}
       router={router}
       {...props} />
    )}
  </SeqReadsAnalysisLayout>;

}

interface WrapperProps {
  router: { replace: (loc: any) => void };
  match: any;
}

export default function ReportByReadsContainerWrapper(props: WrapperProps) {
  const {
    location: {
      pathname,
      query: {output = 'default'} = {}
    } = {}
  } = props.match;
  const lazyLoad = output !== 'printable';

  useWhenNoSeqReads(() =>
    props.router.replace({ pathname: pathname.replace(/report\/*$/, '') })
  );

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
