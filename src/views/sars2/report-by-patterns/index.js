import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';
import useExtendVariables from '../use-extend-variables';
import useApolloClient from '../apollo-client';

import ConfigContext from '../../../utils/config-context';
import PatternLoader from '../../../components/pattern-loader';
import PatternAnalysisLayout from
  '../../../components/pattern-analysis-layout';

import query from './query.graphql';
import PatternReports from './reports';


ReportByPatternsContainer.propTypes = {
  config: PropTypes.object,
  lazyLoad: PropTypes.bool.isRequired,
  output: PropTypes.string,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  patterns: PropTypes.array.isRequired,
  currentSelected: PropTypes.object
};

function ReportByPatternsContainer({
  config,
  router,
  match,
  lazyLoad,
  output,
  patterns,
  currentSelected
}) {

  const client = useApolloClient({
    payload: patterns,
    config
  });
  const onExtendVariables = useExtendVariables({
    config,
    match
  });
  return <PatternAnalysisLayout
   query={query}
   client={client}
   patterns={patterns}
   currentSelected={currentSelected}
   renderPartialResults={output !== 'printable'}
   lazyLoad={lazyLoad}
   extraParams="$drdbVersion: String!, $cmtVersion: String!"
   onExtendVariables={onExtendVariables}>
    {props => (
      <PatternReports
       output={output}
       match={match}
       router={router}
       cmtVersion={config.cmtVersion}
       {...props} />
    )}
  </PatternAnalysisLayout>;

}

ReportByPatternsContainerWrapper.propTypes = {
  match: matchShape.isRequired
};

export default function ReportByPatternsContainerWrapper(props) {
  const {
    location: {
      query: {output = 'default'} = {}
    } = {}
  } = props.match;
  const lazyLoad = output !== 'printable';
  return (
    <ConfigContext.Consumer>
      {config => (
        <PatternLoader lazyLoad={lazyLoad}>
          {({patterns, currentSelected}) => (
            <ReportByPatternsContainer
             {...props}
             output={output}
             lazyLoad={lazyLoad}
             patterns={patterns}
             currentSelected={currentSelected}
             config={config} />
          )}
        </PatternLoader>
      )}
    </ConfigContext.Consumer>
  );
}
