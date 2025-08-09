import React from 'react';
import { useRouter } from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';
import useExtendVariables from '../use-extend-variables';
import useAddParams from '../../../components/seqreads-loader/use-add-params';

import getQuery, { getExtraParams } from './query.graphql';
import SeqTabularReports from './reports';

import { subOptions } from './sub-options';

export { subOptions };

/**
 * Properties for {@link TabularReportByReadsContainer}.
 */
interface TabularReportByReadsContainerProps {
  /** Set of selected sub option indices */
  children: Set<number>;
  /** Uploaded sequence read objects */
  allSequenceReads: any[];
  /** Callback invoked when report generation finishes */
  onFinish: () => void;
  /** URL used to generate pattern links */
  patternsTo: string;
  /** Function returning submit state for extension */
  getSubmitState: () => any;
}

/**
 * Render HIV tabular report by sequence reads.
 *
 * @param props - {@link TabularReportByReadsContainerProps}
 * @returns Rendered component
 */
export default function TabularReportByReadsContainer({
  children,
  allSequenceReads,
  onFinish,
  patternsTo,
  getSubmitState
}: TabularReportByReadsContainerProps): JSX.Element | null {
  const { match } = useRouter();
  const [config, isConfigPending] = ConfigContext.use();

  const [handleExtendVariables, isExtVarPending] = useExtendVariables({
    config,
    getSubmitState
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

  if (isConfigPending || isExtVarPending || isPending) {
    return null;
  }

  return (
    <SeqReadsAnalysisLayout
      query={getQuery(curSubOptions)}
      client={client}
      allSequenceReads={allSeqReadsWithParams}
      currentSelected={{ index: 0 }}
      renderPartialResults={false}
      lazyLoad={false}
      maxPerRequest={3}
      extraParams={getExtraParams(curSubOptions)}
      onExtendVariables={handleExtendVariables}
    >
      {props => (
        <SeqTabularReports
          config={config}
          match={match}
          children={children}
          onFinish={onFinish}
          patternsTo={patternsTo}
          {...props}
        />
      )}
    </SeqReadsAnalysisLayout>
  );
}
