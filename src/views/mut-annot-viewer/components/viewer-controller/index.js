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


ViewerController.propTypes = {
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
};

export default function ViewerController({
  className,
  fragmentOptions,
  seqFragment,
  annotCategories,
  curAnnotNameLookup,
  annotations,
  seqViewerSize,
  onCurAnnotNameLookupChange,
  onSeqViewerSizeChange,
  onSeqFragmentChange
}) {

  const mergedClassName = makeClassNames(
    style['viewer-controller'],
    className
  );

  const handleCurAnnotNamesChange = React.useCallback(
    catName => newCurAnnotNames => {
      const {curAnnotNames} = curAnnotNameLookup[catName];
      if (newCurAnnotNames !== curAnnotNames) {
        curAnnotNameLookup[catName] = newCurAnnotNames;
        onCurAnnotNameLookupChange({...curAnnotNameLookup});
      }
    },
    [curAnnotNameLookup, onCurAnnotNameLookupChange]
  );

  return React.useMemo(
    () => (
      <div className={mergedClassName}>
        <SizeController
         size={seqViewerSize}
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
           onChange={handleCurAnnotNamesChange(cat.name)} />
        ))}
      </div>
    ),
    [
      annotCategories,
      annotations,
      curAnnotNameLookup,
      fragmentOptions,
      handleCurAnnotNamesChange,
      mergedClassName,
      onSeqFragmentChange,
      onSeqViewerSizeChange,
      seqFragment,
      seqViewerSize
    ]
  );
}
