import React from 'react';
import PropTypes from 'prop-types';
import {routerShape, matchShape} from 'found';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import SeqReadsLoader, {
  useWhenNoSeqReads
} from '../../../components/seqreads-loader';
import SeqReadsAnalysisLayout from
  '../../../components/seqreads-analysis-layout';

import query from './query.graphql';
import SeqReadsReports from './reports';


ReportByReadsContainer.propTypes = {
  config: PropTypes.object,
  lazyLoad: PropTypes.bool.isRequired,
  output: PropTypes.string,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  allSequenceReads: PropTypes.array.isRequired,
  currentSelected: PropTypes.object
};

function ReportByReadsContainer({
  config,
  router,
  match,
  lazyLoad,
  output,
  allSequenceReads,
  currentSelected
}) {
  const client = useApolloClient({
    payload: allSequenceReads,
    config
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });

  return <SeqReadsAnalysisLayout
   query={query}
   client={client}
   allSequenceReads={allSequenceReads}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams="$includeGenes: [EnumGene]!"
   onExtendVariables={onExtendVariables}>
    {props => (
      <SeqReadsReports
       config={config}
       output={output}
       match={match}
       router={router}
       {...props} />
    )}
  </SeqReadsAnalysisLayout>;

}


ReportByReadsContainerWrapper.propTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired
};

export default function ReportByReadsContainerWrapper(props) {
  const {
    location: {
      pathname,
      query: {output = 'default'} = {}
    } = {}
  } = props.match;
  const lazyLoad = output !== 'printable';

  useWhenNoSeqReads(() => props.router.replace({
    pathname: pathname.replace(/report\/*$/, '')
  }));

  return (
    <ConfigContext.Consumer>
      {config => (
        <SeqReadsLoader lazyLoad={lazyLoad}>
          {({allSequenceReads, currentSelected}) => (
            <ReportByReadsContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             allSequenceReads={allSequenceReads}
             currentSelected={currentSelected}
             config={config} />
          )}
        </SeqReadsLoader>
      )}
    </ConfigContext.Consumer>
  );
}
