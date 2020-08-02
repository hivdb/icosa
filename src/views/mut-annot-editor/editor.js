import React from 'react';
import PropTypes from 'prop-types';
import union from 'lodash/union';

import SequenceViewer from './components/sequence-viewer';
import EditorController from './components/editor-controller';
import style from './style.module.scss';

import PromiseComponent from '../../utils/promise-component';
import {actions, makePositionLookup} from './utils';


const KEY_SEQVIEWER = '--sierra-seqviewer-size';


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

  constructor() {
    super(...arguments);
    const {
      annotations,
      positions,
      citations
    } = this.props.annotationData;
    const curAnnot = annotations[0] || null;
    this.state = {
      annotations: [...annotations],
      positions: [...positions],
      citations: {...citations},
      curAnnot,
      displayCitationIds: getReferredCitationIds(curAnnot, positions),
      seqViewerSize: loadSeqViewerSize(),
      selectedPositions: [],
      extraReferredCitationIds: []
    };
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
      selectedPositions: []
    });
  }

  handleReset = () => {
    this.setState({selectedPositions: []});
  }

  render() {
    const {
      refSeq
    } = this.props;
    const {
      annotations,
      citations,
      selectedPositions,
      seqViewerSize,
      displayCitationIds,
      curAnnot
    } = this.state;
    const {
      referredCitationIds,
      positionLookup
    } = this;

    return <section className={style.editor}>
      <SequenceViewer
       size={seqViewerSize}
       sequence={refSeq}
       curAnnot={curAnnot}
       positionLookup={positionLookup}
       citations={citations}
       displayCitationIds={displayCitationIds}
       selectedPositions={selectedPositions}
       onChange={this.handlePositionsSelect}
       className={style.seqviewer} />
      <div className={style['controller-container']}>
        <EditorController
         annotations={annotations}
         annotation={curAnnot}
         positionLookup={positionLookup}
         citations={citations}
         referredCitationIds={referredCitationIds}
         displayCitationIds={displayCitationIds}
         onAnnotationChange={this.handleAnnotChange}
         onSeqViewerSizeChange={this.handleSeqViewerSizeChange}
         onDisplayCitationIdsChange={this.handleDisplayCitationIdsChange}
         onSave={this.handleSave}
         onReset={this.handleReset}
         seqViewerSize={seqViewerSize}
         selectedPositions={selectedPositions}
         className={style['controller']} />
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
