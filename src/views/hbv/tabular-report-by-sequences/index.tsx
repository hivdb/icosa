import { ReactElement, useMemo } from 'react';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SequenceAnalysisLayout from
  '../../../components/sequence-analysis-layout';
import useExtendVariables from '../use-extend-variables';

import getQuery from './query.graphql';
import SeqTabularReports from './reports';
import {subOptions} from './sub-options';

export {subOptions};

interface TabularReportBySequencesProps {
  subOptionIndices: number[];
  sequences: any[];
  onFinish: () => void;
  patternsTo: string;
}

/**
 * Render tabular reports for sequence analysis.
 *
 * @param props - {@link TabularReportBySequencesProps} data and callbacks.
 * @returns Rendered tabular report layout.
 */
export default function TabularReportBySequencesContainer({
  subOptionIndices,
  sequences,
  onFinish,
  patternsTo
}: TabularReportBySequencesProps): ReactElement | null {
  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config,
    skip: isConfigPending,
    payload: sequences
  });

  if (isConfigPending || !config) {
    return null;
  }

  const handleExtendVariables = useExtendVariables({
    config: config as {allGenes: string[]}
  });

  const curSubOptions = useMemo(
    () => subOptions.filter((_, idx) => subOptionIndices.includes(idx)),
    [subOptionIndices]
  );

  return <SequenceAnalysisLayout
   query={getQuery()}
   client={client}
   sequences={sequences}
   currentSelected={{index: 0, name: sequences[0]?.header ?? 'Sequence 1'}}
   renderPartialResults={false}
   lazyLoad={false}
   extraParams={`
     $includeGenes: [EnumGene!]!
   `}
   onExtendVariables={handleExtendVariables}>
    {props => (
      <SeqTabularReports
       config={config}
       subOptionIndices={subOptionIndices}
       onFinish={onFinish}
       patternsTo={patternsTo}
       {...props} />
    )}
  </SequenceAnalysisLayout>;

}

