import React, {ReactElement} from 'react';
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
}: TabularReportByReadsProps): ReactElement | null {
  const [config, isConfigPending] = ConfigContext.use();

  const [allSeqReadsWithParams, isPending] = useAddParams({
    defaultParams: config?.seqReadsDefaultParams ?? {},
    allSequenceReads,
    skip: isConfigPending
  });

  const client = useApolloClient({
    config,
    skip: isConfigPending || isPending,
    payload: allSeqReadsWithParams
  });

  if (isConfigPending || isPending || !config) {
    return null;
  }

  const handleExtendVariables = useExtendVariables({
    config: config as {allGenes: string[]}
  });

  const curSubOptions = React.useMemo(
    () => subOptions.filter((_, idx) => children.has(idx)),
    [children]
  );

  return (
    <SeqReadsAnalysisLayout
      query={getQuery(curSubOptions)}
      client={client}
      allSequenceReads={allSeqReadsWithParams ?? []}
      currentSelected={{
        index: 0,
        name: allSeqReadsWithParams?.[0]?.name ?? 'Reads 1'
      }}
      renderPartialResults={false}
      lazyLoad={false}
      extraParams={`
     $includeGenes: [EnumGene!]!,
   `}
      onExtendVariables={handleExtendVariables}
    >
      {props => (
        <SeqTabularReports
          config={config}
          children={children}
          onFinish={onFinish}
          patternsTo={patternsTo}
          {...props}
        />
      )}
    </SeqReadsAnalysisLayout>
  );
}

