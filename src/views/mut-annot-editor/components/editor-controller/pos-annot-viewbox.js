import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import range from 'lodash/range';

import {posShape, annotShape} from '../../prop-types';
import {getAnnotation} from '../../utils';
import LegendContext from '../legend-context';

import style from './style.module.scss';


function getAllAnnotations(props) {
  const {
    positionLookup: posLookup,
    selectedPositions,
    seqLength,
    curAnnot: {name: annotName},
    displayCitationIds
  } = props;
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
    seqLength: PropTypes.number.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    curAnnot: annotShape.isRequired,
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
    const {selectedPositions} = this.props;
    const {annotObjs} = this.state;
    const showAll = selectedPositions.length === 0;
    return (
      <div className={
        makeClassNames(style['input-group'], style['scrollable'])
      }>
        <label>
          {showAll ?
            'Position annotations:' :
            'Annotations of selected positions:'}
        </label>
        <LegendContext.Consumer>
          {({mainAnnotColorLookup}) => (
            annotObjs.map((annot, idx) => (
              <AnnotDesc
               key={idx}
               color={mainAnnotColorLookup[annot.annotVal] || {}}
               {...annot} />
            ))
          )}
        </LegendContext.Consumer>
      </div>
    );
  }

}
