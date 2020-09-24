import React from 'react';
import rfdc from 'rfdc';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import LegendContext from './components/legend-context';
import CanvasSequenceViewer from './components/canvas-sequence-viewer';
import EditorController from './components/editor-controller';
import style from './style.module.scss';

import PromiseComponent from '../../utils/promise-component';
import {actions, makePositionLookup} from './utils';


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


/* function getReferredCitationIds(curAnnot, positions) {
  if (!curAnnot) {
    return [];
  }
  const {name: annotName} = curAnnot;
  let referredCitationIds = [];

  for (const {annotations} of positions) {
    for (const {name, citationIds} of annotations) {
      if (name === annotName) {
        referredCitationIds = union(
          referredCitationIds, citationIds
        );
      }
    }
  }

  return referredCitationIds;
} */


class MutAnnotEditorInner extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    router: routerShape.isRequired,
    region: PropTypes.string,
    name: PropTypes.string.isRequired,
    display: PropTypes.node.isRequired,
    refSeq: PropTypes.string.isRequired,
    annotationData: PropTypes.object.isRequired
  }

  getDefaultState() {
    const {region} = this.props;
    let {
      fragmentOptions,
      annotCategories,
      annotations,
      positions,
      citations
    } = this.props.annotationData;
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
      seqViewerSize: loadSeqViewerSize(),
      selectedPositions: [],
      // extraReferredCitationIds: [],
      allowEditing: false,
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
  }

  /* get referredCitationIds() {
    const {curAnnot, positions, extraReferredCitationIds} = this.state;
    return union(
      getReferredCitationIds(curAnnot, positions),
      extraReferredCitationIds
    );
  } */

  get positionLookup() {
    const {positions} = this.state;
    return makePositionLookup(positions);
  }

  handlePositionsSelect = (selectedPositions) => {
    this.setState({selectedPositions});
  }

  /* handleCurAnnotChange = (curAnnot) => {
    const {positions, extraAnnots} = this.state;
    this.setState({
      curAnnot,
      extraAnnots: extraAnnots.filter(({name}) => name !== curAnnot.name),
      displayCitationIds: getReferredCitationIds(curAnnot, positions),
      selectedPositions: [],
      extraReferredCitationIds: []
    });
  }; */

  /* handleExtraAnnotsChange = (extraAnnots) => {
    if (extraAnnots === null) {
      extraAnnots = this.getDefaultExtraAnnots();
    }
    this.setState({extraAnnots});
  } */

  handleCurAnnotNameLookupChange = (curAnnotNameLookup) => {
    this.setState({curAnnotNameLookup});
  }
  
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

  /* handleDisplayCitationIdsChange = (displayCitationIds) => {
    this.setState({displayCitationIds});
  } */

  handleSave = ({action, ...actionObj}) => {
    const {positionLookup} = this;
    const {
      curAnnot,
      annotations,
      citations,
      // displayCitationIds,
      extraReferredCitationIds
    } = this.state;
    const state = actions[action]({
      actionObj,
      positionLookup,
      curAnnot,
      annotations,
      citations,
      extraReferredCitationIds,
      // displayCitationIds
    });
    this.setState({
      ...state,
      changed: true,
      selectedPositions: []
    });
  }

  handleReset = () => {
    this.setState({selectedPositions: []});
  }

  handleRevertAll = () => {
    this.setState(this.getDefaultState());
  }

  handleToggleAllowEditing = (allowEditing) => {
    this.setState({allowEditing});
  }

  render() {
    const {refSeq} = this.props;
    const {
      seqFragment,
      fragmentOptions,
      annotCategories,
      curAnnotNameLookup,
      annotations,
      citations,
      selectedPositions,
      seqViewerSize,
      allowEditing
    } = this.state;
    const {
      positionLookup
    } = this;

    return <section className={style.editor}>
      <LegendContext>
        <CanvasSequenceViewer
         size={seqViewerSize}
         sequence={refSeq}
         onChange={this.handlePositionsSelect}
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
        <div className={style['controller-container']}>
          <EditorController
           sequence={refSeq}
           onSeqViewerSizeChange={this.handleSeqViewerSizeChange}
           onSeqFragmentChange={this.handleSeqFragmentChange}
           onDisplayCitationIdsChange={this.handleDisplayCitationIdsChange}
           onSave={this.handleSave}
           onReset={this.handleReset}
           onCurAnnotNameLookupChange={this.handleCurAnnotNameLookupChange}
           className={style['controller']}
           {...{
             seqFragment,
             fragmentOptions,
             allowEditing,
             annotCategories,
             curAnnotNameLookup,
             annotations,
             positionLookup,
             citations,
             seqViewerSize,
             selectedPositions
           }} />
        </div>
      </LegendContext>
    </section>;
  }
}


export default class MutAnnotEditor extends React.Component {

  static propTypes = {
    preset: PropTypes.shape({
      name: PropTypes.string.isRequired,
      display: PropTypes.node.isRequired,
      annotationLoader: PropTypes.func.isRequired
    }).isRequired,
    match: matchShape.isRequired,
    router: routerShape.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    const {
      preset: {
        name, display,
        annotationLoader
      },
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
          name, display,
          refSeq: refSequence,
          annotationData,
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
       component={MutAnnotEditorInner} />
    );
  }

}
