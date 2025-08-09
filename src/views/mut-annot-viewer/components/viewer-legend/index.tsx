import React from 'react';
import makeClassNames from 'classnames';

import type {
  Position,
  Citation,
  AnnotCategory,
  CurAnnotNameLookup,
  Annotation
} from '../../prop-types';

import style from './style.module.scss';
import ColorLegend from './color-legend';

/** Props for the `Legend` component. */
interface LegendProps {
  /** Additional CSS class names */
  className?: string;
  /** Sequence fragment range represented as [start, end] */
  seqFragment: [number, number];
  /** Available annotation categories */
  annotCategories: AnnotCategory[];
  /** Lookup for currently selected annotation names */
  curAnnotNameLookup: CurAnnotNameLookup;
  /** All annotation definitions */
  annotations: Annotation[];
  /** Position lookup keyed by position */
  positionLookup: Record<number, Position>;
  /** Citation lookup keyed by citation id */
  citations: Record<string, Citation>;
}

export default function Legend({
  className,
  seqFragment,
  positionLookup,
  citations,
  annotCategories,
  curAnnotNameLookup,
  annotations
}: LegendProps) {

  const colorBoxAnnotDef = React.useMemo(() => {
    const category = annotCategories.find(({annotStyle}) => annotStyle === 'colorBox');
    if (!category) {
      return undefined;
    }
    const catName = category.name;
    const annotName = curAnnotNameLookup[catName][0];
    return annotations.find(({name}) => name === annotName);
  }, [curAnnotNameLookup, annotCategories, annotations])!;

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
