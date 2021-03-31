import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape, withRouter} from 'found';

import {calcOffsetLimit} from './funcs';


class PatternAnalysisLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number,
      name: PropTypes.string
    }),
    patterns: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        mutations: PropTypes.arrayOf(
          PropTypes.string.isRequired
        ).isRequired
      })
    ),
    data: PropTypes.shape({
      currentVersion: PropTypes.object.isRequired,
      currentProgramVersion: PropTypes.object.isRequired,
      patternAnalysis: PropTypes.array.isRequired
    }),
    lazyLoad: PropTypes.bool.isRequired,
    renderPartialResults: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    onFetchMore: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  }

  componentDidMount() {
    const {
      currentSelected: {index: offset},
      patterns,
      onFetchMore,
      lazyLoad
    } = this.props;
    if (lazyLoad) {
      onFetchMore(calcOffsetLimit(
        {patterns, offset, lazyLoad}
      ));
    }
  }

  handleSelectPattern = ({name}) => {
    const {
      match: {location}, router,
      patterns,
      lazyLoad,
      onFetchMore
    } = this.props;
    const loc = {...location, query: {
      ...location.query,
      name
    }};
    const offset = patterns.findIndex(
      ({name: patN}) => patN === name
    );
    onFetchMore(calcOffsetLimit(
      {patterns, offset, lazyLoad}
    ));
    router.replace(loc);
    return new Promise(resolve => (
      this.pendingResolve = resolve
    ));
  }

  render() {
    const {
      patterns,
      data: {
        currentVersion,
        currentProgramVersion,
        patternAnalysis = [],
        ...dataMisc
      },
      currentSelected,
      renderPartialResults,
      loaded,
      children
    } = this.props;

    if (loaded && this.pendingResolve) {
      setTimeout(() => {
        this.pendingResolve && this.pendingResolve();
        delete this.pendingResolve;
      });
    }

    if (loaded || renderPartialResults) {
      return children({
        patterns,
        currentSelected,
        patternAnalysis,
        currentVersion,
        currentProgramVersion,
        onSelectPattern: this.handleSelectPattern,
        loaded,
        ...dataMisc
      });
    }
    else {
      return null;
    }

  }

}


export default withRouter(PatternAnalysisLayout);
