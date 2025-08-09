import {useMemo} from 'react';
import makeClassNames from 'classnames';
import range from 'lodash/range';

import ExtLink from '../../../../components/link/external';
import type {
  Position,
  Annotation,
  Citation,
  AnnotCategory
} from '../../prop-types';
import {getAnnotation} from '../../utils';
import LegendContext from '../legend-context';

import style from './style.module.scss';


/**
 * Arguments for {@link getAllAnnotations}.
 */
interface AllAnnotationsArgs {
  positionLookup: Record<number, Position>;
  seqFragment: [number, number];
  colorBoxAnnotDef: Annotation;
}

/**
 * Aggregated annotation information for a given value.
 */
interface AnnotationObj {
  annotVal: string;
  annotDesc: string | null;
  positions: number[];
}

/**
 * Collect all annotation values and their positions within a fragment.
 *
 * @param positionLookup - lookup table keyed by position
 * @param seqFragment - [start, end] inclusive fragment positions
 * @param colorBoxAnnotDef - annotation definition used for lookups
 * @returns array of aggregated annotation objects
 */
function getAllAnnotations({
  positionLookup: posLookup,
  seqFragment: [posStart, posEnd],
  colorBoxAnnotDef: {name: annotName}
}: AllAnnotationsArgs): AnnotationObj[] {
  const annotObjs: AnnotationObj[] = [];
  const annotLookup: Record<string, AnnotationObj> = {};
  const allPos = range(posStart, posEnd + 1);
  for (const pos of allPos) {
    const posdata = posLookup[pos];
    if (!posdata) {
      continue;
    }
    const {annotations} = posdata;
    const {annotVal, annotDesc} = getAnnotation(annotations, annotName);
    if (annotVal !== null) {
      const annotKey = `${annotVal}$@$@$${annotDesc}`;
      let annotObj: AnnotationObj = {
        annotVal,
        annotDesc,
        positions: []
      };
      if (annotKey in annotLookup) {
        annotObj = annotLookup[annotKey];
      }
      else {
        annotObjs.push(annotObj);
        annotLookup[annotKey] = annotObj;
      }
      annotObj.positions.push(pos);
    }
  }
  return annotObjs;
}


/**
 * Convert a list of integers into a human readable range string.
 *
 * @param numbers - positions to stringify
 * @returns range representation such as "1-3 and 5"
 */
function integersToRangeString(numbers: number[]): string {
  const groups = numbers
    .sort((a, b) => a - b)
    .reduce<number[][]>((acc, num) => {
      if (acc.length === 0) {
        acc.push([num]);
        return acc;
      }
      const prevGroup = acc[acc.length - 1];
      const prevNum = prevGroup[prevGroup.length - 1];
      if (prevNum + 1 === num) {
        // continuous
        prevGroup.push(num);
      }
      else {
        acc.push([num]);
      }
      return acc;
    }, [])
    .map(group => {
      if (group.length === 1) {
        return `${group[0]}`;
      }
      else {
        return `${group[0]}-${group[group.length - 1]}`;
      }
    });
  const lastIdx = groups.length - 1;
  if (lastIdx > 0) {
    return `${groups.slice(0, lastIdx).join(', ')} and ${groups[lastIdx]}`;
  }
  return groups[0];
}


/**
 * Determine if a description is short enough to inline.
 *
 * @param content - description text
 * @returns true if description is short
 */
function isShortDesc(content: string | null): boolean {
  const text = content ?? '';
  return text.length < 6 && !(/\s/.test(text));
}

/** Props for {@link CitationList}. */
interface CitationListProps {
  positionLookup: Record<number, Position>;
  citations: Record<string, Citation>;
  annotName: string;
}

/**
 * Render list of citations for a given annotation.
 */
function CitationList({positionLookup, citations, annotName}: CitationListProps) {
  const citationIds: Record<string, number[]> = {};
  for (const posdata of Object.values(positionLookup)) {
    const annot = posdata.annotations.find(({name}) => name === annotName);
    if (annot) {
      for (const cid of annot.citationIds) {
        citationIds[cid] = citationIds[cid] || [];
        citationIds[cid].push(posdata.position);
      }
    }
  }
  const referreds = Object.keys(citationIds).map(cid => citations[cid]);
  return <ul className={style['citation-list']}>
    {referreds.map(({citationId, sectionId, doi, author, year}, idx) => (
      <li key={idx}>
        <ExtLink href={`https://doi.org/${doi}`}>{author} {year}</ExtLink>
        <span className={style['annot-view-desc']}>
          {' ('}{citationIds[`${citationId}.${sectionId}`].join(', ')})
        </span>
      </li>
    ))}
  </ul>;
}


/** Props for {@link CircleInBoxDesc}. */
interface CircleInBoxDescProps {
  annot: Annotation;
  positionLookup: Record<number, Position>;
  citations: Record<string, Citation>;
}

/**
 * Render description for circle-in-box style annotations.
 */
function CircleInBoxDesc({
  annot: {name: annotName, label, hideCitations},
  positionLookup,
  citations
}: CircleInBoxDescProps) {
  return <div className={makeClassNames(
    style['annot-view-item'],
    style.wrap
  )}>
    <div className={makeClassNames(
      style['annot-view-legend'],
      style['annot-view-legend_circle']
    )}>
      <div className={style.circle}>X</div>
    </div>
    <div className={style['annot-view-text']}>
      <div className={style['annot-view-value']}>
        {label || annotName}
      </div>
      <div className={style['annot-view-desc']}>
        (position with a circle)
      </div>
    </div>
    {hideCitations ? null :
    <CitationList {...{annotName, positionLookup, citations}} />}
  </div>;
}


/** Props for {@link AAColorDesc}. */
interface AAColorDescProps {
  catName: string;
  display?: string | boolean;
  color?: string;
}

/**
 * Render description for amino acid color categories.
 */
function AAColorDesc({catName, display, color}: AAColorDescProps) {
  if (display === false) {
    return null;
  }
  return <div className={makeClassNames(
    style['annot-view-item'],
    style.wrap
  )}>
    <div className={makeClassNames(
      style['annot-view-legend'],
      style['annot-view-legend_with-aa']
    )}>
      X
    </div>
    <div
     className={makeClassNames(
       style['annot-view-legend'],
       style['annot-view-legend_aa']
     )}
     style={{color}}>
      X
    </div>
    <div className={style['annot-view-text']}>
      <div className={style['annot-view-value']} style={{color}}>
        ← {display || catName}
      </div>
    </div>
  </div>;
}


/** Props for {@link AnnotDesc}. */
interface AnnotDescProps {
  positions: number[];
  annotVal: string;
  annotDesc: string | null;
  color: {stroke?: string; bg?: string};
}

/**
 * Render description for a color-box annotation.
 */
function AnnotDesc({positions, annotVal, annotDesc, color}: AnnotDescProps) {
  const rangeStr = integersToRangeString(positions);
  const short = isShortDesc(annotDesc);
  return <div className={style['annot-view-item']}>
    <div
     style={{
       borderColor: color.stroke,
       backgroundColor: color.bg
     }}
     className={style['annot-view-legend']}>
      <div>X</div>
    </div>
    <div className={style['annot-view-text']}>
      <span className={style['annot-view-value']}>{annotVal}</span>
      <span className={style['annot-view-positions']}>
        ({rangeStr}{
          short && annotDesc && annotDesc.length > 0 ?
            `, ${annotDesc}` : null
        })
      </span>
      {!short && <span className={style['annot-view-desc']}>{annotDesc}</span>}
    </div>
  </div>;
}


/** Props for {@link ColorLegend}. */
interface ColorLegendProps {
  seqFragment: [number, number];
  positionLookup: Record<number, Position>;
  colorBoxAnnotDef: Annotation;
  aminoAcidsCats: AnnotCategory[];
  circleInBoxAnnotDef?: Annotation | null;
  citations: Record<string, Citation>;
}

/**
 * Display a detailed legend describing annotations and color mappings.
 */
export default function ColorLegend({
  seqFragment,
  positionLookup,
  colorBoxAnnotDef,
  aminoAcidsCats,
  circleInBoxAnnotDef,
  citations
}: ColorLegendProps) {

  const annotObjs = useMemo(
    () => getAllAnnotations({
      positionLookup,
      seqFragment,
      colorBoxAnnotDef
    }),
    [positionLookup, seqFragment, colorBoxAnnotDef]
  );

  const showCirleInBoxDesc = !!circleInBoxAnnotDef;
  return (
    <div className={style['color-legend']}>
      <h3>Legend:</h3>
      <LegendContext.Consumer>
        {({colorBoxAnnotColorLookup, aminoAcidsCatColorLookup}) => <>
          {annotObjs.length > 0 ? annotObjs.map((annot, idx) => (
            <AnnotDesc
             key={idx}
             color={colorBoxAnnotColorLookup[annot.annotVal] ?? {}}
             {...annot} />
          )) : 'None'}
          <hr />
          {showCirleInBoxDesc ?
            <>
              <CircleInBoxDesc
               positionLookup={positionLookup}
               annot={circleInBoxAnnotDef}
               citations={citations} />
              <hr />
            </> : null}
          {aminoAcidsCats.map(({name, display}, idx) => (
            <AAColorDesc
             key={idx}
             catName={name}
             display={display}
             color={aminoAcidsCatColorLookup[name]} />
          ))}
        </>}
      </LegendContext.Consumer>
    </div>
  );

}
