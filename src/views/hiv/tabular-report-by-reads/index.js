import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';
import useExtendVariables from '../use-extend-variables';
import useAddParams from '../../../components/seqreads-loader/use-add-params';

import getQuery, {getExtraParams} from './query.graphql';
import SeqTabularReports from './reports';

import {subOptions} from './sub-options';

export {subOptions};

TabularReportByReadsContainer.propTypes = {
  children: PropTypes.object, // Set of ids, new interface by seqreads-report
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

  const [handleExtendVariables, isExtVarPending] = useExtendVariables({
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

  const curSubOptions = React.useMemo(
    () => subOptions.filter((_, idx) => children.has(idx)),
    [children]
  );

  if (isConfigPending || isExtVarPending || isPending) {
    return null;
  }

  return <SeqReadsAnalysisLayout
   query={getQuery(curSubOptions)}
   client={client}
   allSequenceReads={allSeqReadsWithParams}
   currentSelected={{index: 0}}
   renderPartialResults={false}
   lazyLoad={false}
   maxPerRequest={3}
   extraParams={getExtraParams(curSubOptions)}
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
