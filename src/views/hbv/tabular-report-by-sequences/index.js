import React from 'react';
import PropTypes from 'prop-types';
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


TabularReportBySequencesContainer.propTypes = {
  subOptionIndices: PropTypes.arrayOf( // old interface used by seq-report
    PropTypes.number.isRequired
  ),
  sequences: PropTypes.array.isRequired,
  onFinish: PropTypes.func.isRequired,
  patternsTo: PropTypes.string.isRequired
};


export default function TabularReportBySequencesContainer({
  subOptionIndices,
  sequences,
  onFinish,
  patternsTo
}) {

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

  const curSubOptions = React.useMemo(
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
