import React from 'react';
import useApolloClient from '../apollo-client';
import useExtendVariables from '../use-extend-variables';

import ConfigContext from '../../../utils/config-context';
import SeqLoader, {
  useWhenNoSequence
} from '../../../components/sequence-loader';
import SeqAnalysisLayout from
  '../../../components/sequence-analysis-layout';

import query from './query.graphql';
import SeqReports from './reports';

interface ReportBySequencesContainerProps {
  config?: any;
  lazyLoad: boolean;
  output?: string;
  match: any;
  sequences: any[];
  currentSelected?: any;
}

/**
 * Render the report for uploaded sequences.
 */
function ReportBySequencesContainer({
  config,
  lazyLoad,
  output,
  match,
  sequences,
  currentSelected
}: ReportBySequencesContainerProps) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(
      'Begin rendering ReportBySequenceContainer',
      (new Date()).getTime()
    );
  }

  const client = useApolloClient({
    payload: sequences,
    config
  });
  const [onExtendVariables, isVarsPending] = useExtendVariables({
    config
  });

  return isVarsPending ? null : <SeqAnalysisLayout
   query={query}
   client={client}
   quickLoadLimit={7}
   maxPerRequest={7}
   sequences={sequences}
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
      <SeqReports
       config={config}
       output={output}
       match={match}
       {...props} />
    )}
  </SeqAnalysisLayout>;

}

interface WrapperProps {
  router: { replace: (loc: any) => void };
  match: any;
}

export default function ReportBySequencesContainerWrapper(props: WrapperProps) {
  const {
    location: {
      pathname,
      query: {
        output = 'default'
      } = {}
    } = {}
  } = props.match;

  useWhenNoSequence(() =>
    props.router.replace({ pathname: pathname.replace(/report\/*$/, '') })
  );

  const lazyLoad = output !== 'printable';

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqLoader lazyLoad={lazyLoad}>
          {({sequences, currentSelected}) => (
            <ReportBySequencesContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             sequences={sequences}
             currentSelected={currentSelected}
             config={config} />
          )}
        </SeqLoader>
      )}
    </ConfigContext.Consumer>
  );
}
