import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import range from 'lodash/range';
import capitalize from 'lodash/capitalize';

import {posShape, annotShape} from '../../prop-types';
import {getAnnotation} from '../../utils';
import LegendContext from '../legend-context';

import style from './style.module.scss';


function getAllAnnotations(props) {
  const {
    positionLookup: posLookup,
    selectedPositions,
    sequence,
    curAnnot: {name: annotName},
    displayCitationIds
  } = props;
  const seqLength = sequence.length;
  const annotObjs = [];
  const annotLookup = {};
  const allPos = (
    selectedPositions.length > 0 ?
      selectedPositions :
      range(1, seqLength + 1)
  );
  for (const pos of allPos) {
    const posdata = posLookup[pos];
    if (!posdata) {
      continue;
    }
    const {annotations} = posdata;
    const {annotVal, annotDesc} = getAnnotation(
      annotations, annotName, displayCitationIds
    );
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


function nl2br(content) {
  content = content.split(/\n/);
  const lastIdx = content.length - 1;
  return <>
    {content.map((part, idx) => (
      idx === lastIdx ? part : <>{part}<br /></>
    ))}
  </>;
}


function PosDetail({refAA, posdata, extraAnnots, extraAnnotColorLookup}) {
  if (!posdata) {
    return null;
  }
  const {position, annotations} = posdata;
  const extraAnnotNames = extraAnnots.map(({name}) => name);
  const displayAnnots = annotations
    .filter(({name}) => extraAnnotNames.includes(name));
  if (displayAnnots.length === 0) {
    return null;
  }
  return <div className={style['annot-view-pos-detail']}>
    <h4>Annotations of position {refAA}{position}:</h4>
    <ul>
      {displayAnnots
       .map(({name, value, aminoAcids, description}) => (
         <li>
           <span
            className={style['extra-annot-name']}
            style={{
              borderBottomColor: extraAnnotColorLookup[name]
            }}
            data-annot-level={
              aminoAcids && aminoAcids.length > 0 ?
              'aminoAcid': 'position'
            }>
             {name}
           </span>
           {aminoAcids && aminoAcids.length > 0 ? <>
             {' '}({refAA}{position}{
               aminoAcids
               .join('/')
               .replace('i', 'ins')
               .replace('d', 'del')
             })
           </> : null}
           {description ? <>
             <div className={style['annot-view-desc']}>
               {description}
             </div>
           </> : null}
         </li>
      ))}
    </ul>
  </div>;
}


function AnnotDesc({positions, annotVal, annotDesc, color}) {
  const rangeStr = integersToRangeString(positions);
  return <div className={style['annot-view-item']}>
    <div
     style={{
       borderColor: color.stroke,
       backgroundColor: color.bg
     }}
     className={style['annot-view-legend']}>
      X
    </div>
    <div className={style['annot-view-text']}>
      <div className={style['annot-view-value']}>{annotVal}</div>
      <div className={style['annot-view-positions']}>(POS {rangeStr})</div>
      <div className={style['annot-view-desc']}>{nl2br(annotDesc)}</div>
    </div>
  </div>;
}


export default class PosAnnotViewBox extends React.Component {

  static propTypes = {
    sequence: PropTypes.string.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    curAnnot: annotShape.isRequired,
    extraAnnots: PropTypes.arrayOf(annotShape.isRequired).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired
  }

  static getDerivedStateFromProps(props) {
    return {
      annotObjs: getAllAnnotations(props)
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props);
  }

  render() {
    const {
      curAnnot: {name: annotName},
      positionLookup, sequence,
      extraAnnots, selectedPositions
    } = this.props;
    const {annotObjs} = this.state;
    const showAll = selectedPositions.length === 0;
    const showDetail = selectedPositions.length === 1;
    return (
      <div className={
        makeClassNames(style['input-group'], style['scrollable'])
      }>
        <h3>
          {capitalize(annotName)}s
          {showAll ? null : ' of selected positions'}
          :
        </h3>
        <LegendContext.Consumer>
          {({mainAnnotColorLookup, extraAnnotColorLookup}) => <>
            {annotObjs.length > 0 ? annotObjs.map((annot, idx) => (
              <AnnotDesc
               key={idx}
               color={mainAnnotColorLookup[annot.annotVal] || {}}
               {...annot} />
            )) : 'None'}
            {showDetail ? (
              <PosDetail
               refAA={sequence[selectedPositions[0] - 1]}
               extraAnnotColorLookup={extraAnnotColorLookup}
               posdata={positionLookup[selectedPositions[0]]}
               extraAnnots={extraAnnots} />
            ) : null}
          </>}
        </LegendContext.Consumer>
      </div>
    );
  }

}
