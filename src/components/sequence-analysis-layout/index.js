import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Loader from 'react-loader';
import recurMerge from 'object-merge';
import {matchShape, routerShape} from 'found';

import ChunkQuery from '../chunk-query';
import BigData from '../../utils/big-data';
import PromiseComponent from '../../utils/promise-component';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';

const LIMIT = 100;

function getQuery(fragment, extraParams) {
  return gql`
    query SequenceAnalyses(
      $sequences: [UnalignedSequenceInput]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      sequenceAnalysis(sequences: $sequences) {
        inputSequence { header }
        ${includeFragment(fragment, 'SequenceAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}


class SequenceAnalysisInner extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    render: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
    extraParams: PropTypes.string,
    sequences: PropTypes.arrayOf(
      PropTypes.shape({
        'header': PropTypes.string.isRequired,
        'sequence': PropTypes.string.isRequired
      }).isRequired
    ).isRequired,
    renderPartialResults: PropTypes.bool.isRequired,
    onSaveCache: PropTypes.func,
    cachedProps: PropTypes.object,
    onRequireVariables: PropTypes.func.isRequired,
    lazyLoad: PropTypes.bool.isRequired
  }

  static defaultProps = {
    renderPartialResults: false,
    onRequireVariables: (d) => d,
    lazyLoad: false
  }

  hasCache() {
    const {match: {location: loc}} = this.props;
    return loc.query && 'load' in loc.query;
  }

  get currentSelected() {
    const {match: {location}} = this.props;
    const {sequences, lazyLoad} = this.props;
    if (!lazyLoad) { return undefined; }
    let {hash} = location;
    hash = (hash || '').replace(/^#/, '').trim();
    hash = decodeURI(hash);
    if (hash === '') {
      return {index: 0, header: sequences[0].header};
    }
    const index = Math.max(0, sequences.findIndex(s => s.header === hash));
    return {index, header: sequences[index].header};
  }

  handleSelectSequence = ({header}) => {
    const {match: {location}, router} = this.props;
    const loc = recurMerge(location, {hash: `#${header}`});
    router.push(loc);
  }

  handleRequireVariables = (data) => {
    const {sequences, lazyLoad, onRequireVariables} = this.props;
    let offset, limit, total, done;
    if (lazyLoad) {
      const {currentSelected} = this;
      offset = currentSelected.index;
      limit = 1;
      total = 1;
      done = typeof data !== 'undefined';
    }
    else {
      // pre-load first four results
      offset = 0;
      limit = 4;
      if (typeof data !== 'undefined' && 'sequenceAnalysis' in data) {
        offset = data.sequenceAnalysis.length;
        limit = LIMIT;
      }
      total = sequences.length;
      done = offset === total;
    }
    return onRequireVariables({
      variables: {
        sequences: sequences.slice(offset, offset + limit)
      },
      progress: offset,
      nextProgress: Math.min(total, (offset + limit)),
      total, done
    }, this.props);
  }

  handleMergeData = (prevData, nextData) => {
    return {
      ...prevData,
      sequenceAnalysis: [
        ...prevData.sequenceAnalysis,
        ...nextData.sequenceAnalysis
      ]
    };
  }

  async handleSaveCache(data) {
    const {match: {location}, router} = this.props;
    const {onSaveCache} = this.props;
    const load = await onSaveCache(data);
    if (load) {
      router.replace({
        ...location,
        query: {load}
      });
    }
  }

  thenRender = (props, emptyProps, done) => {
    const {currentSelected} = this;
    const {
      onSaveCache, renderPartialResults,
      sequences, ...otherProps
    } = this.props;
    if (done && !this.hasCache() && onSaveCache) {
      this.handleSaveCache({sequences, props});
    }
    if (emptyProps) {
      if (renderPartialResults) {
        return this.props.render({
          sequences, currentSelected, sequenceAnalysis: [],
          currentVersion: {}, currentProgramVersion: {},
          onSelectSequence: this.handleSelectSequence,
          ...otherProps
        });
      }
      else {
        return <Loader loaded={false} />;
      }
    }
    else if (done || renderPartialResults) {
      const {
        currentVersion,
        currentProgramVersion,
        sequenceAnalysis,
        ...otherProps2} = props;
      return this.props.render({
        sequences, currentSelected, sequenceAnalysis,
        currentVersion, currentProgramVersion,
        onSelectSequence: this.handleSelectSequence,
        ...otherProps, ...otherProps2
      });
    }
    else {
      return <Loader loaded={false} />;
    }
  }

  render() {
    const {query, extraParams, cachedProps} = this.props;
    if (this.hasCache()) {
      if (cachedProps) {
        // cache loaded
        return this.thenRender(cachedProps, false, true);
      }
      else {
        // cache still loading
        return <Loader loaded={false} />;
      }
    }
    else {
      return (
        <ChunkQuery
         query={getQuery(query, extraParams)}
         render={this.thenRender}
         progressText={(progress, total) => (
           `Processing sequences... (${progress}/${total})`
         )}
         onRequireVariables={this.handleRequireVariables}
         onMergeData={this.handleMergeData}
         renderPartialResults />
      );
    }
  }

}


export default class SequenceAnalysisLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    onLoadCache: PropTypes.func,
    onPrepareProps: PropTypes.func
  }

  constructor() {
    super(...arguments);
    this._sequences_cache = {};
  }

  async prepareChildProps() {
    const {onLoadCache, onPrepareProps, ...props} = this.props;
    const {match: {location: loc}} = this.props;
    let childProps;
    if (onLoadCache && loc.query && 'load' in loc.query) {
      const {sequences, props: cachedProps} = await onLoadCache(loc.query.load);
      childProps = {...props, sequences, cachedProps};
    }
    else {
      const key = loc.state.sequences;
      if (!key) {
        console.error("There's not location.state.sequences for current view.");
      }
      let sequences;
      if (key in this._sequences_cache) {
        sequences = this._sequences_cache[key];
      }
      else {
        sequences = await BigData.load(key);
        sequences.map(seq => {
          delete seq.size;
          return seq;
        });
        this._sequences_cache[key] = sequences;
      }
      childProps = {...props, sequences};
    }
    if (onPrepareProps) {
      childProps = {...childProps, ...(await onPrepareProps(loc))};
    }
    return childProps;
  }

  render() {
    const promise = this.prepareChildProps();
    return (
      <PromiseComponent promise={promise}
       component={SequenceAnalysisInner} />
    );
  }

}
