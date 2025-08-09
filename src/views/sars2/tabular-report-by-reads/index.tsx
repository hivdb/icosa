import React from 'react';
import {useRouter} from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';
import useExtendVariables from '../use-extend-variables';
import useAddParams from '../../../components/seqreads-loader/use-add-params';

import getQuery, {getExtraParams} from './query.graphql';
import SeqTabularReports from './reports';

import {subOptions} from './sub-options';

export {subOptions};

interface TabularReportByReadsContainerProps {
  /** Set of child option indices indicating selected reports. */
  children: Set<number>;
  /** All sequence reads to analyze. */
  allSequenceReads: any[];
  /** Callback when analysis finishes. */
  onFinish: () => void;
  /** URL path to pattern report. */
  patternsTo: string;
}

/**
 * Render tabular reports for sequence reads.
 */
export default function TabularReportByReadsContainer({
  children,
  allSequenceReads,
  onFinish,
  patternsTo
}: TabularReportByReadsContainerProps): JSX.Element | null {

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
   extraParams={getExtraParams(curSubOptions)}
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

