import React from 'react';
import {useRouter} from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';
import useExtendVariables from '../use-extend-variables';
import useAddParams from '../../../components/seqreads-loader/use-add-params';

import getQuery from './query.graphql';
import SeqTabularReports from './reports';

import {subOptions} from './sub-options';

export {subOptions};

interface TabularReportByReadsProps {
  children: Set<number>;
  allSequenceReads: any[];
  onFinish: () => void;
  patternsTo: string;
}

/**
 * Render tabular reports for sequence reads.
 *
 * @param props - {@link TabularReportByReadsProps} with data and callbacks.
 * @returns Rendered tabular report component.
 */
export default function TabularReportByReadsContainer({
  children,
  allSequenceReads,
  onFinish,
  patternsTo
}: TabularReportByReadsProps): JSX.Element {

  const {match} = useRouter();
  const [config, isConfigPending] = ConfigContext.use();

  const handleExtendVariables = useExtendVariables({
    config,
    match
  });

  const [allSeqReadsWithParams, isPending] = useAddParams({
    defaultParams: config ? config.seqReadsDefaultParams : {},
    allSequenceReads,
    skip: isConfigPending
  });

  const client = useApolloClient({
    config,
    skip: isConfigPending || isPending,
    payload: allSeqReadsWithParams
  });

  const curSubOptions = React.useMemo(
    () => subOptions.filter((_, idx) => children.has(idx)),
    [children]
  );

  if (isConfigPending || isPending) {
    return null;
  }

  return <SeqReadsAnalysisLayout
   query={getQuery(curSubOptions)}
   client={client}
   allSequenceReads={allSeqReadsWithParams}
   currentSelected={{index: 0}}
   renderPartialResults={false}
   lazyLoad={false}
   extraParams={`
     $includeGenes: [EnumGene!]!
   `}
   onExtendVariables={handleExtendVariables}>
    {props => (
      <SeqTabularReports
       config={config}
       children={children}
       onFinish={onFinish}
       patternsTo={patternsTo}
       {...props} />
    )}
  </SeqReadsAnalysisLayout>;

}

