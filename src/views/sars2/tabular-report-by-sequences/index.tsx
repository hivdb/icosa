import React from 'react';
import {useRouter} from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SequenceAnalysisLayout from
  '../../../components/sequence-analysis-layout';
import useExtendVariables from '../use-extend-variables';

import getQuery, {getExtraParams} from './query.graphql';
import SeqTabularReports from './reports';
import {subOptions} from './sub-options';

export {subOptions};

interface TabularReportBySequencesContainerProps {
  /** indices of selected report sub-options */
  subOptionIndices: number[];
  /** sequences to be analysed */
  sequences: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** callback triggered when report generation finishes */
  onFinish: () => void;
  /** prefix used when linking patterns in the report */
  patternsTo: string;
}

/**
 * Render tabular reports for uploaded sequences.
 *
 * @param subOptionIndices - indices of selected report types.
 * @param sequences - sequences to analyse.
 * @param onFinish - callback triggered when processing completes.
 * @param patternsTo - prefix for pattern links inside the reports.
 * @returns JSX layout wrapping {@link SequenceAnalysisLayout} or `null` when
 * the configuration is still pending.
 */
export default function TabularReportBySequencesContainer({
  subOptionIndices,
  sequences,
  onFinish,
  patternsTo
}: TabularReportBySequencesContainerProps): React.ReactElement | null {

  const {match} = useRouter();
  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config: config as any,
    skip: isConfigPending,
    payload: sequences
  });

  const handleExtendVariables = useExtendVariables({
    config: config as Record<string, any>,
    match
  });

  const curSubOptions = React.useMemo(
    () => subOptions.filter((_, idx) => subOptionIndices.includes(idx)),
    [subOptionIndices]
  );

  if (isConfigPending || !config) {
    return null;
  }

  const firstSeqName =
    sequences[0]?.name ||
    sequences[0]?.inputSequence?.header ||
    'Sequence 1';

  return (
    <SequenceAnalysisLayout
      query={getQuery(curSubOptions)}
      client={client}
      sequences={sequences}
      currentSelected={{index: 0, name: firstSeqName}}
      renderPartialResults={false}
      lazyLoad={false}
      extraParams={getExtraParams(curSubOptions)}
      onExtendVariables={handleExtendVariables}
    >
      {(props) => (
        <SeqTabularReports
          config={config}
          subOptionIndices={subOptionIndices}
          onFinish={onFinish}
          patternsTo={patternsTo}
          {...props}
        />
      )}
    </SequenceAnalysisLayout>
  );

}

