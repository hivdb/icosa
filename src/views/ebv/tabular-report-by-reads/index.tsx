import {ReactElement, useMemo} from 'react';
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
}: TabularReportByReadsProps): ReactElement | null {

  const [config, isConfigPending] = ConfigContext.use();

  const handleExtendVariables = useExtendVariables({
    config: config as {allGenes: string[]} | undefined
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

    const curSubOptions = useMemo(
      () => subOptions.filter((_, idx) => children.has(idx)),
      [children]
    );

  if (isConfigPending || isPending) {
    return null;
  }

    const firstName = allSeqReadsWithParams?.[0]?.name ?? '';
    return <SeqReadsAnalysisLayout
     query={getQuery(curSubOptions)}
     client={client}
     allSequenceReads={allSeqReadsWithParams || []}
     currentSelected={{index: 0, name: firstName}}
     renderPartialResults={false}
     lazyLoad={false}
     extraParams={getExtraParams()}
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
