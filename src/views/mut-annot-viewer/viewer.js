import React from 'react';
import rfdc from 'rfdc';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import LegendContext from './components/legend-context';
import CanvasSequenceViewer from './components/canvas-sequence-viewer';
import ViewerController from './components/viewer-controller';
import ViewerLegend from './components/viewer-legend';
import ViewerFooter from './components/viewer-footer';
import style from './style.module.scss';

import PromiseComponent from '../../utils/promise-component';
import {makePositionLookup} from './utils';


const KEY_SEQVIEWER = '--sierra-seqviewer-size';
const clone = rfdc();


function loadSeqViewerSize() {
  let size = window.localStorage.getItem(KEY_SEQVIEWER);
  if (!['large', 'middle', 'small'].includes(size)) {
    size = 'middle';
  }
  return size;
}


function saveSeqViewerSize(size) {
  window.localStorage.setItem(KEY_SEQVIEWER, size);
}


class MutAnnotViewerInner extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    region: PropTypes.string,
    name: PropTypes.string.isRequired,
    display: PropTypes.node.isRequired,
    refSeq: PropTypes.string.isRequired,
    refDataLoader: PropTypes.func,
    annotationData: PropTypes.object.isRequired
  };

  getDefaultState() {
    const {region} = this.props;
    let {
      annotationData: {
        fragmentOptions,
        annotCategories,
        annotations,
        positions,
        citations,
        comments = []
      }
    } = this.props;
    comments = clone(comments);
    fragmentOptions = clone(fragmentOptions);
    annotCategories = clone(annotCategories);
    const curAnnotNameLookup = annotCategories.reduce((acc, cat) => {
      if (cat.multiSelect) {
        acc[cat.name] = cat.defaultAnnots;
      }
      else if (cat.defaultAnnot) {
        acc[cat.name] = [cat.defaultAnnot];
      }
      return acc;
    }, {});
    annotations = clone(annotations);
    positions = clone(positions);
    citations = clone(citations);
    const {seqFragment} = (
      fragmentOptions.find(
        ({name}) => name === region
      ) || fragmentOptions[0]
    );
    return {
      fragmentOptions,
      seqFragment,
      annotCategories,
      curAnnotNameLookup,
      annotations,
      positions,
      citations,
      comments,
      seqViewerSize: loadSeqViewerSize(),
      selectedPositions: [],
      changed: false
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.getDefaultState();
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.handleBeforeUnload, false);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  handleBeforeUnload = (evt) => {
    const {changed} = this.state;
    if (changed) {
      evt.preventDefault();
      evt.returnValue = true;
    }
  };

  get commentLookup() {
    const {comments: {data}} = this.state;
    return makePositionLookup(data);
  }

  get positionLookup() {
    const {positions} = this.state;
    return makePositionLookup(positions);
  }

  handlePositionsSelect = (selectedPositions) => {
    this.setState({selectedPositions});
  };

  handleCurAnnotNameLookupChange = (curAnnotNameLookup) => {
    this.setState({curAnnotNameLookup});
  };

  handleSeqViewerSizeChange = (seqViewerSize) => {
    this.setState({seqViewerSize});
    saveSeqViewerSize(seqViewerSize);
  };

  handleSeqFragmentChange = (region) => {
    const {router, location} = this.props;
    const {fragmentOptions} = this.state;
    const newLoc = {
      ...location,
      query: {
        ...location.query,
        region
      }
    };
    router.push(newLoc);
    const {seqFragment} = fragmentOptions.find(({name}) => name === region);
    this.setState({seqFragment});
  };

  render() {
    const {refSeq, refDataLoader} = this.props;
    const {
      seqFragment,
      fragmentOptions,
      annotCategories,
      curAnnotNameLookup,
      annotations,
      citations,
      selectedPositions,
      seqViewerSize,
      comments: {references: commentReferences}
    } = this.state;
    const {
      positionLookup,
      commentLookup
    } = this;

    return <LegendContext>
      <section className={style.viewer}>
        <div className={style['controller-container']}>
          <ViewerController
           sequence={refSeq}
           onSeqViewerSizeChange={this.handleSeqViewerSizeChange}
           onSeqFragmentChange={this.handleSeqFragmentChange}
           onDisplayCitationIdsChange={this.handleDisplayCitationIdsChange}
           onCurAnnotNameLookupChange={this.handleCurAnnotNameLookupChange}
           className={style['controller']}
           {...{
             seqFragment,
             fragmentOptions,
             annotCategories,
             curAnnotNameLookup,
             annotations,
             seqViewerSize
           }} />
        </div>
        <CanvasSequenceViewer
         size={seqViewerSize}
         sequence={refSeq}
         onChange={this.handlePositionsSelect}
         noBlurSelector={`*[class*="footer-container"], *[role="tooltip"]`}
         className={style.seqviewer}
         {...{
           seqFragment,
           annotCategories,
           curAnnotNameLookup,
           annotations,
           positionLookup,
           citations,
           selectedPositions
         }} />
        <div className={style['legend-container']}>
          <ViewerLegend
           sequence={refSeq}
           className={style['legend']}
           {...{
             seqFragment,
             annotCategories,
             curAnnotNameLookup,
             annotations,
             positionLookup,
             citations,
             selectedPositions
           }} />
        </div>
      </section>
      <ViewerFooter
       {...{
         refDataLoader,
         commentLookup,
         commentReferences,
         selectedPositions
       }} />
    </LegendContext>;
  }
}


export default class MutAnnotViewer extends React.Component {

  static propTypes = {
    preset: PropTypes.shape({
      name: PropTypes.string.isRequired,
      display: PropTypes.node.isRequired,
      annotationLoader: PropTypes.func.isRequired
    }).isRequired,
    refDataLoader: PropTypes.func,
    match: matchShape.isRequired,
    router: routerShape.isRequired
  };

  static getDerivedStateFromProps(props, state) {
    const {
      preset: {
        name, display,
        annotationLoader
      },
      refDataLoader,
      router,
      match: {location}
    } = props;
    let region = null;
    if (location.query && location.query.region) {
      region = location.query.region;
    }
    if (
      state.region === region &&
      state.annotationLoader === annotationLoader
    ) {
      return null;
    }
    let extraProps = {
      location, router
    };
    if (region) {
      extraProps.region = region;
    }

    return {
      annotationLoader,
      promise: (async () => {
        const {refSequence, ...annotationData} = await annotationLoader();
        return {
          name,
          display,
          refSeq: refSequence,
          annotationData,
          refDataLoader,
          ...extraProps
        };
      })()
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props, {});
  }

  render() {
    const {promise} = this.state;
    return (
      <PromiseComponent
       promise={promise}
       component={MutAnnotViewerInner} />
    );
  }

}
