import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import {
  posShape, citationShape, fragmentOptionShape,
  annotCategoryShape, curAnnotNameLookupShape,
  annotShape, seqViewerSizeType
} from '../../prop-types';

import style from './style.module.scss';
import ColorLegend from './color-legend';
import SizeController from './size-controller';
import FragmentDropdown from './fragment-dropdown';
import AnnotCategory from './annot-category';


export default class EditorController extends React.Component {

  static propTypes = {
    allowEditing: PropTypes.bool.isRequired,
    className: PropTypes.string,
    fragmentOptions: PropTypes.arrayOf(
      fragmentOptionShape.isRequired
    ).isRequired,
    seqFragment: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    annotCategories: PropTypes.arrayOf(
      annotCategoryShape.isRequired
    ).isRequired,
    curAnnotNameLookup: curAnnotNameLookupShape.isRequired,
    annotations: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
    seqViewerSize: seqViewerSizeType.isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    sequence: PropTypes.string.isRequired,
    onCurAnnotNameLookupChange: PropTypes.func.isRequired,
    onSeqFragmentChange: PropTypes.func.isRequired,
    onSeqViewerSizeChange: PropTypes.func.isRequired,
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

  get colorBoxAnnotDef() {
    const {curAnnotNameLookup, annotCategories, annotations} = this.props;
    const catName = (
      annotCategories
        .find(({annotStyle}) => annotStyle === 'colorBox')
        .name
    );
    const annotName = curAnnotNameLookup[catName][0];
    return annotations.find(({name}) => name === annotName);
  }

  get circleInBoxAnnotDef() {
    const {curAnnotNameLookup, annotCategories, annotations} = this.props;
    const category = (
      annotCategories
        .find(({annotStyle}) => annotStyle === 'circleInBox')
    );
    if (!category) {
      return null;
    }
    const catName = category.name;
    const annotName = curAnnotNameLookup[catName][0];
    return annotations.find(({name}) => name === annotName);
  }

  handleCurAnnotNamesChange(catName) {
    return (newCurAnnotNames) => {
      const {curAnnotNameLookup, onCurAnnotNameLookupChange} = this.props;
      const {curAnnotNames} = curAnnotNameLookup[catName];
      if (JSON.stringify(newCurAnnotNames) !== JSON.stringify(curAnnotNames)) {
        curAnnotNameLookup[catName] = newCurAnnotNames;
        onCurAnnotNameLookupChange(curAnnotNameLookup);
      }
    };
  }

  render() {
    const {
      className
      // isEditing
    } = this;
    const {
      allowEditing,
      curAnnotNameLookup,
      fragmentOptions,
      seqFragment,
      positionLookup,
      // selectedPositions,
      seqViewerSize,
      onSeqViewerSizeChange,
      onSeqFragmentChange,
      citations,
      // onReset,
      onSave,
      annotCategories,
      annotations
    } = this.props;

    return (
      <div className={className}>
        <SizeController
         size={seqViewerSize}
         allowEditing={allowEditing}
         onChange={onSeqViewerSizeChange} />
        <FragmentDropdown
         fragmentOptions={fragmentOptions}
         seqFragment={seqFragment}
         onChange={onSeqFragmentChange} />
        {annotCategories.map((cat, idx) => (
          <AnnotCategory
           key={idx}
           annotCategory={cat}
           curAnnotNames={curAnnotNameLookup[cat.name]}
           annotations={annotations}
           onChange={this.handleCurAnnotNamesChange(cat.name)}
           onSave={onSave}
           allowEditing={allowEditing} />
        ))}
        <ColorLegend
         seqFragment={seqFragment}
         citations={citations}
         colorBoxAnnotDef={this.colorBoxAnnotDef}
         circleInBoxAnnotDef={this.circleInBoxAnnotDef}
         aminoAcidsCats={
           annotCategories
           .filter(({annotStyle}) => annotStyle === 'aminoAcids')
         }
         positionLookup={positionLookup} />
      </div>
    );
  }

}