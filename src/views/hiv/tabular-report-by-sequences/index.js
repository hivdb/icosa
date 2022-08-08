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
  patternsTo: PropTypes.string.isRequired,
  getSubmitState: PropTypes.func.isRequired
};


export default function TabularReportBySequencesContainer({
  subOptionIndices,
  sequences,
  onFinish,
  patternsTo,
  getSubmitState
}) {
  const {match} = useRouter();

  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config,
    skip: isConfigPending,
    payload: sequences
  });

  const [handleExtendVariables, isExtVarPending] = useExtendVariables({
    config,
    getSubmitState
  });

  const curSubOptions = React.useMemo(
    () => subOptions.filter((_, idx) => subOptionIndices.includes(idx)),
    [subOptionIndices]
  );

  if (isConfigPending || isExtVarPending) {
    return null;
  }

  return <SequenceAnalysisLayout
   query={getQuery(curSubOptions)}
   client={client}
   sequences={sequences}
   currentSelected={{index: 0}}
   renderPartialResults={false}
   lazyLoad={false}
   maxPerRequest={14}
   extraParams={getExtraParams(curSubOptions)}
   onExtendVariables={handleExtendVariables}>
    {props => (
      <SeqTabularReports
       config={config}
       match={match}
       subOptionIndices={subOptionIndices}
       onFinish={onFinish}
       patternsTo={patternsTo}
       {...props} />
    )}
  </SequenceAnalysisLayout>;

}
