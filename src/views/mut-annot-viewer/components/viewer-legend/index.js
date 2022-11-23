import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import {
  posShape, citationShape,
  annotCategoryShape, curAnnotNameLookupShape,
  annotShape
} from '../../prop-types';

import style from './style.module.scss';
import ColorLegend from './color-legend';


Legend.propTypes = {
  className: PropTypes.string,
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
  citations: PropTypes.objectOf(citationShape.isRequired).isRequired
  /* selectedPositions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  sequence: PropTypes.string.isRequired */
};

export default function Legend({
  className,
  seqFragment,
  positionLookup,
  citations,
  annotCategories,
  curAnnotNameLookup,
  annotations
}) {

  const colorBoxAnnotDef = React.useMemo(
    () => {
      const catName = (
        annotCategories
          .find(({annotStyle}) => annotStyle === 'colorBox')
          .name
      );
      const annotName = curAnnotNameLookup[catName][0];
      return annotations.find(({name}) => name === annotName);
    },
    [curAnnotNameLookup, annotCategories, annotations]
  );

  const circleInBoxAnnotDef = React.useMemo(
    () => {
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
    },
    [curAnnotNameLookup, annotCategories, annotations]
  );

  return (
    <div className={makeClassNames(style['viewer-legend'], className)}>
      <ColorLegend
       seqFragment={seqFragment}
       citations={citations}
       colorBoxAnnotDef={colorBoxAnnotDef}
       circleInBoxAnnotDef={circleInBoxAnnotDef}
       aminoAcidsCats={
           annotCategories
             .filter(({annotStyle}) => annotStyle === 'aminoAcids')
         }
       positionLookup={positionLookup} />
    </div>
  );

}
