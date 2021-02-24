import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape, withRouter} from 'found';

import {calcOffsetLimit} from './funcs';
import {SequenceReadsPropType} from './prop-types';


class SeqReadsAnalysisLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number,
      name: PropTypes.string
    }),
    allSequenceReads: PropTypes.arrayOf(
      SequenceReadsPropType.isRequired
    ),
    data: PropTypes.shape({
      currentVersion: PropTypes.object.isRequired,
      currentProgramVersion: PropTypes.object.isRequired,
      sequenceReadsAnalysis: PropTypes.array.isRequired
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
      allSequenceReads,
      onFetchMore,
      lazyLoad
    } = this.props;
    if (lazyLoad) {
      onFetchMore(calcOffsetLimit(
        {allSequenceReads, offset, lazyLoad}
      ));
    }
  }

  handleSelectSeqReads = ({name}) => {
    const {
      match: {location}, router,
      allSequenceReads,
      lazyLoad,
      onFetchMore
    } = this.props;
    const loc = {...location, query: {
      ...location.query,
      name
    }};
    const offset = allSequenceReads.findIndex(
      ({name: seqN}) => seqN === name
    );
    onFetchMore(calcOffsetLimit(
      {allSequenceReads, offset, lazyLoad}
    ));
    router.replace(loc);
    return new Promise(resolve => (
      this.pendingResolve = resolve
    ));
  }

  render() {
    const {
      allSequenceReads,
      data: {
        currentVersion,
        currentProgramVersion,
        sequenceReadsAnalysis = [],
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
        allSequenceReads,
        currentSelected,
        sequenceReadsAnalysis,
        currentVersion,
        currentProgramVersion,
        onSelectSeqReads: this.handleSelectSeqReads,
        loaded,
        ...dataMisc
      });
    }
    else {
      return null;
    }

  }

}


export default withRouter(SeqReadsAnalysisLayout);
