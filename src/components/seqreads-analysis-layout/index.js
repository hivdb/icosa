import React from 'react';
import {routerShape, matchShape} from 'found';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import Loader from 'react-loader';
import recurMerge from 'object-merge';

import config from '../../config';
import ChunkQuery from '../chunk-query';
import BigData from '../../utils/big-data';
import PromiseComponent from '../../utils/promise-component';
import {
  includeFragment, includeFragmentIfExist
} from '../../utils/graphql-helper';

const LIMIT = 100;
const DEFAULT_CUTOFF = config.seqReadsDefaultCutoff;

const SeqReadsContext = React.createContext({});


function getQuery(fragment, extraQueryArgTypes) {
  let extArgs = Object.entries(extraQueryArgTypes)
    .map(([key, typeText]) => `$${key}: ${typeText}`)
    .join(', ');
  if (extArgs.length > 0) {
    extArgs = ', ' + extArgs;
  }
  return gql`
    query SeqReadsAnalyses($allSequenceReads: [SequenceReadsInput]!${extArgs}) {
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      sequenceReadsAnalysis(sequenceReads: $allSequenceReads) {
        name
        ${includeFragment(fragment, 'SequenceReadsAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}


function cleanSeqReads(allSeqReads) {
  const results = [];
  for (const seqReads of allSeqReads) {
    const {name, strain, allReads, minPrevalence, minReadDepth} = seqReads;
    const newAllReads = [];
    for (const {gene, position, totalReads, allCodonReads} of allReads) {
      const newAllCodonReads = [];
      for (const {codon, reads} of allCodonReads) {
        newAllCodonReads.push({codon, reads});
      }
      newAllReads.push({
        gene, position, totalReads,
        allCodonReads: newAllCodonReads
      });
    }
    results.push({
      name, strain,
      allReads: newAllReads,
      minPrevalence,
      ...(minReadDepth ? {minReadDepth} : {})
    });
  }
  return results;
}


const SequenceReadsPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  strain: PropTypes.oneOf(['HIV1', 'HIV2A', 'HIV2B']).isRequired,
  allReads: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.oneOf(['PR', 'RT', 'IN']).isRequired,
      position: PropTypes.number.isRequired,
      totalReads: PropTypes.number.isRequired,
      allCodonReads: PropTypes.arrayOf(
        PropTypes.shape({
          codon: PropTypes.string.isRequired,
          reads: PropTypes.number.isRequired
        }).isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  minPrevalence: PropTypes.number,
  minReadDepth: PropTypes.number
});


class SequenceReadsAnalysisInner extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    render: PropTypes.func.isRequired,
    query: PropTypes.object.isRequired,
    allSequenceReads: PropTypes.arrayOf(
      SequenceReadsPropType.isRequired
    ).isRequired,
    renderPartialResults: PropTypes.bool.isRequired,
    noCache: PropTypes.bool.isRequired,
    onSaveCache: PropTypes.func,
    cachedProps: PropTypes.object,
    lazyLoad: PropTypes.bool.isRequired,
    extraQueryArgs: PropTypes.object.isRequired,
    extraQueryArgTypes: PropTypes.object.isRequired
  }

  static defaultProps = {
    renderPartialResults: false,
    noCache: false,
    lazyLoad: false
  }

  hasCache() {
    const {location: loc} = this.props.match;
    return loc.query && 'load' in loc.query;
  }

  get currentSelected() {
    const {location} = this.props.match;
    const {allSequenceReads, lazyLoad} = this.props;
    if (!lazyLoad) { return undefined; }
    let {hash} = location;
    hash = (hash || '').replace(/^#/, '').trim();
    hash = decodeURI(hash);
    if (hash === '') {
      return {index: 0, header: allSequenceReads[0].name};
    }
    const index = Math.max(0, allSequenceReads.findIndex(s => s.name === hash));
    return {index, name: allSequenceReads[index].name};
  }

  handleSelectSequenceReads = ({name}) => {
    const {match: {location}, router} = this.props;
    const loc = recurMerge(location, {hash: `#${name}`});
    router.push(loc);
  }

  handleRequireVariables = (data) => {
    const {allSequenceReads, lazyLoad, extraQueryArgs} = this.props;
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
      if (typeof data !== 'undefined' && 'viewer' in data) {
        offset = data.sequenceReadsAnalysis.length;
        limit = LIMIT;
      }
      total = allSequenceReads.length;
      done = offset === total;
    }
    return {
      variables: {
        ...extraQueryArgs,
        allSequenceReads: cleanSeqReads(
          allSequenceReads.slice(offset, offset + limit)
        )
      },
      progress: offset,
      nextProgress: Math.min(total, (offset + limit)),
      total, done
    };
  }

  handleMergeData = (prevData, nextData) => {
    return {
      ...prevData,
      sequenceReadsAnalysis: [
        ...prevData.viewer.sequenceReadsAnalysis,
        ...nextData.viewer.sequenceReadsAnalysis
      ]
    };
  }

  async handleSaveCache(data) {
    const {match: {location}, router, onSaveCache} = this.props;
    const load = await onSaveCache(data);
    if (load) {
      router.replace({
        ...location,
        query: {load}
      });
    }
  }

  thenRender = (props, emptyProps) => {
    const {currentSelected} = this;
    const {onSaveCache, allSequenceReads, ...otherProps} = this.props;
    if (!this.hasCache() && onSaveCache) {
      this.handleSaveCache({allSequenceReads, props});
      return <Loader loaded={false} />;
    }
    else if (emptyProps || !props || Object.keys(props).length === 0) {
      if (this.props.renderPartialResults) {
        return this.props.render({
          allSequenceReads, currentSelected, sequenceReadsAnalysis: [],
          currentVersion: {}, currentProgramVersion: {},
          onSelectSequenceReads: this.handleSelectSequenceReads,
          ...otherProps
        });
      }
      else {
        return <Loader loaded={false} />;
      }
    }
    else {
      const {
        currentVersion,
        currentProgramVersion,
        sequenceReadsAnalysis,
        ...otherProps2
      } = props;
      return this.props.render({
        allSequenceReads, currentSelected, sequenceReadsAnalysis,
        currentVersion, currentProgramVersion,
        onSelectSequenceReads: this.handleSelectSequenceReads,
        ...otherProps, ...otherProps2
      });
    }
  }

  render() {
    const {
      allSequenceReads,
      query, renderPartialResults, noCache,
      cachedProps, extraQueryArgTypes
    } = this.props;
    if (this.hasCache()) {
      if (cachedProps) {
        // cache loaded
        return this.thenRender(cachedProps);
      }
      else {
        // cache still loading
        return <Loader loaded={false} />;
      }
    }
    else {
      return (
        <SeqReadsContext.Provider value={{allSequenceReads}}>
          <ChunkQuery
           {...{renderPartialResults, noCache}}
           query={getQuery(query, extraQueryArgTypes)}
           render={this.thenRender}
           progressText={(progress, total) => (
             `Processing sequence reads... (${progress}/${total})`
           )}
           onRequireVariables={this.handleRequireVariables}
           onMergeData={this.handleMergeData} />
        </SeqReadsContext.Provider>
      );
    }
  }

}


export default class SequenceReadsAnalysisLayout extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    extraQueryArgs: PropTypes.object.isRequired,
    extraQueryArgTypes: PropTypes.object.isRequired,
    onLoadCache: PropTypes.func
  }

  static defaultProps = {
    extraQueryArgs: {},
    extraQueryArgTypes: {}
  }

  static SequenceReadsConsumer = SeqReadsContext.Consumer

  constructor() {
    super(...arguments);
    this._seqReadsCache = {};
  }

  async prepareChildProps() {
    const {onLoadCache, ...props} = this.props;
    const {location: loc} = this.props.match;
    let allSequenceReads = [];
    let cachedProps;
    if (onLoadCache && loc.query && 'load' in loc.query) {
      const cachedData = await onLoadCache(loc.query.load);
      allSequenceReads = cachedData.allSequenceReads;
      cachedProps = cachedData.props;
    }
    else if (loc.state && loc.state.allSequenceReads) {
      const key = loc.state.allSequenceReads;
      if (!key) {
        console.error(
          "There's not location.state.allSequenceReads for current view."
        );
      }
      if (key in this._seqReadsCache) {
        allSequenceReads = this._seqReadsCache[key];
      }
      else {
        allSequenceReads = await BigData.load(key);
        this._seqReadsCache[key] = allSequenceReads;
      }
    }
    // attach query parameters
    const {query} = loc;
    let cutoff, rd;
    if (query !== null) {
      cutoff = query.cutoff;
      rd = query.rd;
    }
    let minPrevalence = parseFloat(cutoff);
    minPrevalence = isNaN(minPrevalence) ? DEFAULT_CUTOFF : minPrevalence;
    let minReadDepth = parseInt(rd, 10);
    minReadDepth = isNaN(minReadDepth) ? undefined : minReadDepth;
    allSequenceReads = allSequenceReads.map(sr => {
      sr = {...sr};  // deep-copy to avoid cache
      sr.minPrevalence = minPrevalence;
      sr.minReadDepth = minReadDepth;
      return sr;
    });
    return {...props, allSequenceReads, cachedProps};
  }

  render() {
    const promise = this.prepareChildProps();
    return (
      <PromiseComponent promise={promise}
       component={SequenceReadsAnalysisInner} />
    );
  }

}
