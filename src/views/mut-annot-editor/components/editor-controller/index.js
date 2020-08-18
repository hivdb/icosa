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
import ExtraAnnotFilter from './extra-annot-filter';
import CitationFilter from './citation-filter';
import PosAnnotEditBox from './pos-annot-editbox';
import AAAnnotEditBox from './aa-annot-editbox';
import PosAnnotViewBox from './pos-annot-viewbox';


export default class EditorController extends React.Component {

  static propTypes = {
    allowEditing: PropTypes.bool.isRequired,
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    defaultExtraAnnots: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    className: PropTypes.string,
    curAnnot: annotShape.isRequired,
    extraAnnots: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
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
    sequence: PropTypes.string.isRequired,
    onSeqViewerSizeChange: PropTypes.func.isRequired,
    onAnnotationChange: PropTypes.func.isRequired,
    onExtraAnnotsChange: PropTypes.func.isRequired,
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
    const {allowEditing, selectedPositions} = this.props;
    return allowEditing && selectedPositions.length > 0;
  }

  render() {
    const {
      className,
      isEditing
    } = this;
    const {
      allowEditing,
      positionLookup,
      selectedPositions,
      referredCitationIds,
      displayCitationIds,
      seqViewerSize,
      onSeqViewerSizeChange,
      onAnnotationChange,
      onExtraAnnotsChange,
      onDisplayCitationIdsChange,
      onReset,
      onSave,
      curAnnot,
      annotations,
      defaultExtraAnnots,
      citations,
      sequence,
      curAnnot: {
        level: annotLevel
      },
      extraAnnots
    } = this.props;

    return (
      <div className={className}>
        <SizeController
         size={seqViewerSize}
         allowEditing={allowEditing}
         onChange={onSeqViewerSizeChange} />
        <AnnotationFilter
         onChange={onAnnotationChange}
         {...{
           onSave,
           allowEditing,
           curAnnot,
           annotations
         }} />
        <ExtraAnnotFilter
         onChange={onExtraAnnotsChange}
         {...{
           onSave,
           allowEditing,
           annotations,
           defaultExtraAnnots,
           extraAnnots
         }} />
        <CitationFilter
         onChange={onDisplayCitationIdsChange}
         {...{
           onSave,
           curAnnot,
           allowEditing,
           citations,
           referredCitationIds,
           displayCitationIds}} />
        {isEditing && annotLevel === 'position' ?
          <PosAnnotEditBox
           {...{
             positionLookup,
             citations,
             curAnnot,
             referredCitationIds,
             displayCitationIds,
             selectedPositions,
             onDisplayCitationIdsChange,
             onReset,
             onSave
           }} /> : null}
        {!isEditing && annotLevel === 'position' ?
          <PosAnnotViewBox
           {...{
             positionLookup,
             curAnnot,
             displayCitationIds,
             selectedPositions
           }} /> : null}
        {isEditing && annotLevel === 'amino acid' ?
          <AAAnnotEditBox
           {...{
             positionLookup,
             citations,
             curAnnot,
             referredCitationIds,
             displayCitationIds,
             selectedPosition: selectedPositions[0],
             sequence,
             onDisplayCitationIdsChange,
             onReset,
             onSave
           }} /> : null}
      </div>
    );
  }

}
