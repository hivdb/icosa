import React from 'react';
import rfdc from 'rfdc';
import PropTypes from 'prop-types';
import union from 'lodash/union';
import {matchShape} from 'found';

import LegendContext from './components/legend-context';
import CanvasSequenceViewer from './components/canvas-sequence-viewer';
import EditorController from './components/editor-controller';
import EditorMenu from './components/editor-menu';
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


function getReferredCitationIds(curAnnot, positions) {
  if (!curAnnot) {
    return [];
  }
  const {
    name: annotName, level: annotLevel
  } = curAnnot;
  let referredCitationIds = [];

  if (annotLevel === 'position') {
    unionCitations(positions);
  }
  else {
    for (const {aminoAcids} of positions) {
      unionCitations(aminoAcids);
    }
  }
  return referredCitationIds;

  function unionCitations(items) {
    for (const {annotations} of items) {
      for (const {name, citationIds} of annotations) {
        if (name === annotName) {
          referredCitationIds = union(
            referredCitationIds, citationIds
          );
        }
      }
    }
  }
}


class MutAnnotEditorInner extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    display: PropTypes.node.isRequired,
    refSeq: PropTypes.string.isRequired,
    annotationData: PropTypes.object.isRequired
  }

  getDefaultExtraAnnots() {
    const {
      annotations,
      defaultExtraAnnots = []
    } = this.props.annotationData;
    return annotations.filter(
      ({name}) => defaultExtraAnnots.includes(name)
    );
  }

  getDefaultState() {
    let {
      annotations,
      defaultExtraAnnots = [],
      positions,
      citations
    } = this.props.annotationData;
    annotations = clone(annotations);
    positions = clone(positions);
    citations = clone(citations);
    const curAnnot = annotations[0] || null;
    return {
      annotations,
      defaultExtraAnnots,
      positions,
      citations,
      curAnnot,
      extraAnnots: this.getDefaultExtraAnnots(),
      displayCitationIds: getReferredCitationIds(curAnnot, positions),
      seqViewerSize: loadSeqViewerSize(),
      selectedPositions: [],
      extraReferredCitationIds: [],
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

  get referredCitationIds() {
    const {curAnnot, positions, extraReferredCitationIds} = this.state;
    return union(
      getReferredCitationIds(curAnnot, positions),
      extraReferredCitationIds
    );
  }

  get positionLookup() {
    const {positions} = this.state;
    return makePositionLookup(positions);
  }

  handlePositionsSelect = (selectedPositions) => {
    this.setState({selectedPositions});
  }

  handleCurAnnotChange = (curAnnot) => {
    const {positions, extraAnnots} = this.state;
    this.setState({
      curAnnot,
      extraAnnots: extraAnnots.filter(({name}) => name !== curAnnot.name),
      displayCitationIds: getReferredCitationIds(curAnnot, positions),
      selectedPositions: [],
      extraReferredCitationIds: []
    });
  };

  handleExtraAnnotsChange = (extraAnnots) => {
    if (extraAnnots === null) {
      extraAnnots = this.getDefaultExtraAnnots();
    }
    this.setState({extraAnnots});
  }
  
  handleSeqViewerSizeChange = (seqViewerSize) => {
    this.setState({seqViewerSize});
    saveSeqViewerSize(seqViewerSize);
  };

  handleDisplayCitationIdsChange = (displayCitationIds) => {
    this.setState({displayCitationIds});
  }

  handleSave = ({action, ...actionObj}) => {
    const {positionLookup} = this;
    const {
      curAnnot,
      annotations,
      citations,
      displayCitationIds,
      extraReferredCitationIds
    } = this.state;
    const state = actions[action]({
      actionObj,
      positionLookup,
      curAnnot,
      annotations,
      citations,
      extraReferredCitationIds,
      displayCitationIds
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
    const {
      refSeq,
      annotationData: {gene, taxonomy}
    } = this.props;
    const {
      annotations,
      defaultExtraAnnots,
      citations,
      selectedPositions,
      seqViewerSize,
      displayCitationIds,
      curAnnot,
      extraAnnots,
      positions,
      allowEditing,
      changed
    } = this.state;
    const {
      referredCitationIds,
      positionLookup
    } = this;

    return <section className={style.editor}>
      <EditorMenu
       className={style['menu']}
       onRevertAll={this.handleRevertAll}
       onToggleAllowEditing={this.handleToggleAllowEditing}
       {...{
         gene,
         taxonomy,
         annotations,
         defaultExtraAnnots,
         positions,
         citations,
         allowEditing,
         changed}} />
      <LegendContext>
        <CanvasSequenceViewer
         size={seqViewerSize}
         sequence={refSeq}
         onChange={this.handlePositionsSelect}
         className={style.seqviewer}
         {...{
           curAnnot,
           extraAnnots,
           positionLookup,
           citations,
           displayCitationIds,
           selectedPositions
         }} />
        <div className={style['controller-container']}>
          <EditorController
           sequence={refSeq}
           onCurAnnotChange={this.handleCurAnnotChange}
           onExtraAnnotsChange={this.handleExtraAnnotsChange}
           onSeqViewerSizeChange={this.handleSeqViewerSizeChange}
           onDisplayCitationIdsChange={this.handleDisplayCitationIdsChange}
           onSave={this.handleSave}
           onReset={this.handleReset}
           className={style['controller']}
           {...{
             allowEditing,
             annotations,
             curAnnot,
             defaultExtraAnnots,
             extraAnnots,
             positionLookup,
             citations,
             referredCitationIds,
             displayCitationIds,
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
      refSeqLoader: PropTypes.func.isRequired,
      annotationLoader: PropTypes.func.isRequired
    }).isRequired,
    match: matchShape.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    const {
      preset: {
        name, display,
        refSeqLoader, annotationLoader
      }
    } = props;
    if (
      state.refSeqLoader === refSeqLoader &&
      state.annotationLoader === annotationLoader
    ) {
      return null;
    }
    return {
      refSeqLoader,
      annotationLoader,
      promise: (async () => ({
        name, display,
        refSeq: await refSeqLoader(),
        annotationData: await annotationLoader()
      }))()
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
