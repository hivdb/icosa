import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import range from 'lodash/range';

import ExtLink from '../../../../components/link/external';
import {
  posShape, annotShape,
  citationShape,
  annotCategoryShape
} from '../../prop-types';
import {getAnnotation} from '../../utils';
import LegendContext from '../legend-context';

import style from './style.module.scss';


function getAllAnnotations({
  positionLookup: posLookup,
  seqFragment: [posStart, posEnd],
  colorBoxAnnotDef: {name: annotName}
}) {
  const annotObjs = [];
  const annotLookup = {};
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
      let annotObj = {
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


function integersToRangeString(numbers) {
  const groups = (numbers
    .sort((a, b) => a - b)
    .reduce((acc, num) => {
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
    })
  );
  const lastIdx = groups.length - 1;
  if (lastIdx > 0) {
    return `${groups.slice(0, lastIdx).join(', ')} and ${groups[lastIdx]}`;
  }
  return groups[0];
}


function isShortDesc(content) {
  return content.length < 6 && !(/\s/.test(content));
}


CitationList.propTypes = {
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
  citations: PropTypes.objectOf(citationShape.isRequired).isRequired,
  annotName: PropTypes.string.isRequired
};

function CitationList({positionLookup, citations, annotName}) {
  const citationIds = {};
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


CircleInBoxDesc.propTypes = {
  annot: annotShape.isRequired,
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
  citations: PropTypes.objectOf(citationShape.isRequired).isRequired
};

function CircleInBoxDesc({
  annot: {name: annotName, label, hideCitations},
  positionLookup,
  citations
}) {
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


AAColorDesc.propTypes = {
  catName: PropTypes.string.isRequired,
  display: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.bool.isRequired
  ]).isRequired,
  color: PropTypes.string
};

function AAColorDesc({catName, display, color}) {
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


AnnotDesc.propTypes = {
  color: PropTypes.object.isRequired,
  positions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  annotVal: PropTypes.string.isRequired,
  annotDesc: PropTypes.string.isRequired
};

function AnnotDesc({positions, annotVal, annotDesc, color}) {
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


ColorLegend.propTypes = {
  seqFragment: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
  colorBoxAnnotDef: annotShape.isRequired,
  aminoAcidsCats: PropTypes.arrayOf(
    annotCategoryShape.isRequired
  ).isRequired,
  circleInBoxAnnotDef: annotShape,
  citations: PropTypes.objectOf(citationShape.isRequired).isRequired
};

export default function ColorLegend({
  seqFragment,
  positionLookup,
  colorBoxAnnotDef,
  aminoAcidsCats,
  circleInBoxAnnotDef,
  citations
}) {

  const annotObjs = React.useMemo(
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
             color={colorBoxAnnotColorLookup[annot.annotVal] || {}}
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
