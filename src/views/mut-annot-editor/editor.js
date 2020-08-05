import React from 'react';
import rfdc from 'rfdc';
import PropTypes from 'prop-types';
import union from 'lodash/union';

import SequenceViewer from './components/sequence-viewer';
import EditorController from './components/editor-controller';
import EditorMenu from './components/editor-menu';
import style from './style.module.scss';

import PromiseComponent from '../../utils/promise-component';
import {actions, makePositionLookup} from './utils';


const KEY_SEQVIEWER = '--sierra-seqviewer-size';
const clone = rfdc();


function loadSeqViewerSize() {
  let size = window.localStorage.getItem(KEY_SEQVIEWER);
  if (size !== 'large' && size !== 'middle' && size !== 'small') {
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

  getDefaultState() {
    let {
      annotations,
      positions,
      citations
    } = this.props.annotationData;
    annotations = clone(annotations);
    positions = clone(positions);
    citations = clone(citations);
    const curAnnot = annotations[0] || null;
    return {
      annotations,
      positions,
      citations,
      curAnnot,
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

  handleAnnotChange = (curAnnot) => {
    const {positions} = this.state;
    this.setState({
      curAnnot,
      displayCitationIds: getReferredCitationIds(curAnnot, positions),
      selectedPositions: [],
      extraReferredCitationIds: []
    });
  };
  
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
      citations,
      selectedPositions,
      seqViewerSize,
      displayCitationIds,
      curAnnot,
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
         positions,
         citations,
         allowEditing,
         changed}} />
      <SequenceViewer
       size={seqViewerSize}
       sequence={refSeq}
       onChange={this.handlePositionsSelect}
       className={style.seqviewer}
       {...{
         curAnnot,
         positionLookup,
         citations,
         displayCitationIds,
         selectedPositions
       }} />
      <div className={style['controller-container']}>
        <EditorController
         sequence={refSeq}
         onAnnotationChange={this.handleAnnotChange}
         onSeqViewerSizeChange={this.handleSeqViewerSizeChange}
         onDisplayCitationIdsChange={this.handleDisplayCitationIdsChange}
         onSave={this.handleSave}
         onReset={this.handleReset}
         className={style['controller']}
         {...{
           allowEditing,
           annotations,
           curAnnot,
           positionLookup,
           citations,
           referredCitationIds,
           displayCitationIds,
           seqViewerSize,
           selectedPositions
         }} />
      </div>
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
    }).isRequired
  }

  static getDerivedStateFromProps(props, state) {
    const {name, display, refSeqLoader, annotationLoader} = props.preset;
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
