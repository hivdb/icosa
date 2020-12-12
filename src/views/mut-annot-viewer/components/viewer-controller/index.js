import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import {
  fragmentOptionShape,
  annotCategoryShape, curAnnotNameLookupShape,
  annotShape, seqViewerSizeType
} from '../../prop-types';

import style from './style.module.scss';
import SizeController from './size-controller';
import FragmentDropdown from './fragment-dropdown';
import AnnotCategory from './annot-category';


export default class ViewerController extends React.Component {

  static propTypes = {
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
    seqViewerSize: seqViewerSizeType.isRequired,
    onCurAnnotNameLookupChange: PropTypes.func.isRequired,
    onSeqFragmentChange: PropTypes.func.isRequired,
    onSeqViewerSizeChange: PropTypes.func.isRequired
  }

  get className() {
    const {className} = this.props;
    return makeClassNames(
      style['viewer-controller'],
      className
    );
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
    const {className} = this;
    const {
      allowEditing,
      curAnnotNameLookup,
      fragmentOptions,
      seqFragment,
      seqViewerSize,
      onSeqViewerSizeChange,
      onSeqFragmentChange,
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
           onSave={onSave} />
        ))}
      </div>
    );
  }

}
