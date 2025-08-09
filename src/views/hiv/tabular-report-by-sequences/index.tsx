import React from 'react';
import { useRouter } from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SequenceAnalysisLayout from
  '../../../components/sequence-analysis-layout';
import useExtendVariables from '../use-extend-variables';

import getQuery, { getExtraParams } from './query.graphql';
import SeqTabularReports from './reports';
import { subOptions } from './sub-options';

export { subOptions };

interface TabularReportBySequencesContainerProps {
  /** Indices of sub report options selected */
  subOptionIndices: number[];
  /** Uploaded sequences */
  sequences: any[];
  /** Callback when report finishes */
  onFinish: () => void;
  /** URL to build pattern links */
  patternsTo: string;
  /** Submit state getter */
  getSubmitState: () => any;
}

/**
 * Container component that renders HIV tabular reports for uploaded sequences.
 *
 * @param props - {@link TabularReportBySequencesContainerProps}
 * @returns Wrapped {@link SequenceAnalysisLayout} or `null` while loading.
 */
export default function TabularReportBySequencesContainer({
  subOptionIndices,
  sequences,
  onFinish,
  patternsTo,
  getSubmitState
}: TabularReportBySequencesContainerProps): React.ReactElement | null {
  const { match } = useRouter();

  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config: config as { graphqlURI: string },
    skip: isConfigPending,
    payload: sequences
  });

  const [handleExtendVariables, isExtVarPending] = useExtendVariables({
    config: config as { allGenes: string[] },
    getSubmitState
  });

  const curSubOptions = React.useMemo(
    () => subOptions.filter((_, idx) => subOptionIndices.includes(idx)),
    [subOptionIndices]
  );

  if (isConfigPending || isExtVarPending) {
    return null;
  }

  const firstName =
    sequences[0]?.name || sequences[0]?.inputSequence?.header || '';

  return (
    <SequenceAnalysisLayout
      query={getQuery(curSubOptions)}
      client={client}
      sequences={sequences}
      currentSelected={{ index: 0, name: firstName }}
      renderPartialResults={false}
      lazyLoad={false}
      maxPerRequest={14}
      extraParams={getExtraParams(curSubOptions)}
      onExtendVariables={handleExtendVariables}
    >
      {props => (
        <SeqTabularReports
          config={config}
          match={match}
          subOptionIndices={subOptionIndices}
          onFinish={onFinish}
          patternsTo={patternsTo}
          {...props}
        />
      )}
    </SequenceAnalysisLayout>
  );

}
