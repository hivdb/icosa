import React from 'react';
import PropTypes from 'prop-types';
import ConfigContext from '../../../utils/config-context';
import SequenceAnalysisLayout from
  '../../../components/sequence-analysis-layout';
import useApolloClient from '../apollo-client';
import useExtendVariables from '../use-extend-variables';
import query from './query.graphql';
import HCVTabularReports from './reports';
import {subOptions} from './sub-options';

export {subOptions};

export default function HCVTabularReportBySequences({
  subOptionIndices,
  sequences,
  onFinish,
  patternsTo
}) {
  const [config, isConfigPending] = ConfigContext.use();
  const client = useApolloClient({
    config,
    skip: isConfigPending,
    payload: sequences
  });
  const onExtendVariables = useExtendVariables({config});

  if (isConfigPending) { return null; }

  return <SequenceAnalysisLayout
   query={query}
   client={client}
   sequences={sequences}
   currentSelected={{index: 0}}
   renderPartialResults={false}
   lazyLoad={false}
   extraParams="$includeGenes: [EnumGene!]!"
   onExtendVariables={onExtendVariables}>
    {props => <HCVTabularReports
     {...props}
     config={config}
     subOptionIndices={subOptionIndices}
     onFinish={onFinish}
     patternsTo={patternsTo} />}
  </SequenceAnalysisLayout>;
}

HCVTabularReportBySequences.propTypes = {
  subOptionIndices: PropTypes.arrayOf(PropTypes.number.isRequired),
  sequences: PropTypes.array.isRequired,
  onFinish: PropTypes.func.isRequired,
  patternsTo: PropTypes.string.isRequired
};
