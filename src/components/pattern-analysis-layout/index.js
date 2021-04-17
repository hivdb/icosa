import React from 'react';
import PropTypes from 'prop-types';

import PatAnalysisQuery from './query';

import {calcInitOffsetLimit} from '../cumu-query';


function PatternAnalysisContainer(props) {
  const {
    currentSelected,
    patterns,
    lazyLoad
  } = props;

  return (
    <PatAnalysisQuery
     {...props}
     {...calcInitOffsetLimit({
       size: patterns.length,
       curIndex: currentSelected.index,
       lazyLoad
     })} />
  );

}


PatternAnalysisContainer.propTypes = {
  query: PropTypes.object.isRequired,
  extraParams: PropTypes.string,
  patterns: PropTypes.array.isRequired,
  currentSelected: PropTypes.shape({
    index: PropTypes.number,
    name: PropTypes.string
  }),
  client: PropTypes.any.isRequired,
  progressText: PropTypes.func.isRequired,
  onExtendVariables: PropTypes.func.isRequired,
  lazyLoad: PropTypes.bool.isRequired,
  renderPartialResults: PropTypes.bool.isRequired,
  children: PropTypes.func.isRequired
};

PatternAnalysisContainer.defaultProps = {
  renderPartialResults: true,
  progressText: (progress, total) => (
    `Running pattern analysis... (${progress}/${total})`
  ),
  onExtendVariables: vars => vars
};

export default PatternAnalysisContainer;
