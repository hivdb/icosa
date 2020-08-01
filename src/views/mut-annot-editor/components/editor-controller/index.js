import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import {
  posShape, citationShape,
  annotShape, seqViewerSizeType
} from '../../prop-types';

import style from './style.module.scss';
import SizeController from './size-controller';
import AnnotationFilter from './annotation-filter';
import CitationFilter from './citation-filter';
import EditDialogueBox from './edit-dialogue-box';


export default class EditorController extends React.Component {

  static propTypes = {
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    className: PropTypes.string,
    annotation: annotShape.isRequired,
    referredCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    seqViewerSize: seqViewerSizeType.isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    onSeqViewerSizeChange: PropTypes.func.isRequired,
    onAnnotationChange: PropTypes.func.isRequired,
    onDisplayCitationIdsChange: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
  }

  get className() {
    const {className} = this.props;
    return makeClassNames(
      style['editor-controller'],
      className
    );
  }

  get isEditing() {
    const {selectedPositions} = this.props;
    return selectedPositions.length > 0;
  }

  render() {
    const {
      className,
      isEditing
    } = this;
    const {
      positionLookup,
      selectedPositions,
      referredCitationIds,
      displayCitationIds,
      seqViewerSize,
      onSeqViewerSizeChange,
      onAnnotationChange,
      onDisplayCitationIdsChange,
      onReset,
      onSave,
      annotation,
      annotations,
      citations
    } = this.props;

    return (
      <div className={className}>
        <SizeController
         size={seqViewerSize}
         onChange={onSeqViewerSizeChange} />
        <AnnotationFilter
         curAnnot={annotation}
         annotations={annotations}
         onChange={onAnnotationChange}
         onSave={onSave} />
        <CitationFilter
         {...{
           citations,
           referredCitationIds,
           displayCitationIds}}
         onChange={onDisplayCitationIdsChange} />
        {isEditing ?
          <EditDialogueBox
           {...{
             positionLookup,
             citations,
             annotation,
             referredCitationIds,
             displayCitationIds,
             selectedPositions,
             onDisplayCitationIdsChange,
             onReset,
             onSave
           }} /> : null}
      </div>
    );
  }

}
