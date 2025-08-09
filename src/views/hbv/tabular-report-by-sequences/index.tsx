import { ReactElement, useMemo } from 'react';
import {useRouter} from 'found';
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

  const {match} = useRouter();
  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config,
    skip: isConfigPending,
    payload: sequences
  });

  const handleExtendVariables = useExtendVariables({
    config,
    match
  });

  const curSubOptions = useMemo(
    () => subOptions.filter((_, idx) => subOptionIndices.includes(idx)),
    [subOptionIndices]
  );

  if (isConfigPending) {
    return null;
  }

  return <SequenceAnalysisLayout
   query={getQuery(curSubOptions)}
   client={client}
   sequences={sequences}
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
       subOptionIndices={subOptionIndices}
       onFinish={onFinish}
       patternsTo={patternsTo}
       {...props} />
    )}
  </SequenceAnalysisLayout>;

}

