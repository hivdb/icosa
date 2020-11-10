import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape, withRouter} from 'found';

import {calcOffsetLimit} from './funcs';


class SequenceAnalysisLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number,
      header: PropTypes.string
    }),
    sequences: PropTypes.arrayOf(
      PropTypes.shape({
        header: PropTypes.string.isRequired,
        sequence: PropTypes.string.isRequired
      })
    ),
    data: PropTypes.shape({
      currentVersion: PropTypes.object.isRequired,
      currentProgramVersion: PropTypes.object.isRequired,
      sequenceAnalysis: PropTypes.array.isRequired
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
      sequences,
      onFetchMore,
      lazyLoad
    } = this.props;
    if (lazyLoad) {
      onFetchMore(calcOffsetLimit(
        {sequences, offset, lazyLoad}
      ));
    }
  }

  handleSelectSequence = ({header}) => {
    const {
      match: {location}, router,
      sequences,
      lazyLoad,
      onFetchMore
    } = this.props;
    const loc = {...location, query: {
      ...location.query,
      header
    }};
    const offset = sequences.findIndex(
      ({header: seqH}) => seqH === header
    );
    onFetchMore(calcOffsetLimit(
      {sequences, offset, lazyLoad}
    ));
    router.replace(loc);
    return new Promise(resolve => (
      this.pendingResolve = resolve
    ));
  }

  render() {
    const {
      sequences,
      data: {
        currentVersion,
        currentProgramVersion,
        sequenceAnalysis = []
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
        sequences,
        currentSelected,
        sequenceAnalysis,
        currentVersion,
        currentProgramVersion,
        onSelectSequence: this.handleSelectSequence,
        loaded
      });
    }
    else {
      return null;
    }

  }

}


export default withRouter(SequenceAnalysisLayout);
