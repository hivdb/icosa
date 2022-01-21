import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';
import useExtendVariables from '../use-extend-variables';
import useAddParams from '../../../components/seqreads-loader/use-add-params';

import query from './query.graphql';
import SeqTabularReports from './reports';

export {subOptions} from './sub-options';

TabularReportByReadsContainer.propTypes = {
  children: PropTypes.object, // new interface used by seqreads-report
  allSequenceReads: PropTypes.array.isRequired,
  onFinish: PropTypes.func.isRequired,
  patternsTo: PropTypes.string.isRequired
};


export default function TabularReportByReadsContainer({
  children,
  allSequenceReads,
  onFinish,
  patternsTo
}) {

  const {match} = useRouter();
  const [config, isConfigPending] = ConfigContext.use();

  const handleExtendVariables = useExtendVariables({
    config,
    match
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

  if (isConfigPending || isPending) {
    return null;
  }

  return <SeqReadsAnalysisLayout
   query={query}
   client={client}
   allSequenceReads={allSeqReadsWithParams}
   currentSelected={{index: 0}}
   renderPartialResults={false}
   lazyLoad={false}
   extraParams="$drdbVersion: String!, $cmtVersion: String!"
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
