import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import {posShape, annotShape} from '../../prop-types';
import {getAnnotation} from '../../utils';

import style from './style.module.scss';


function getAllAnnotations(props) {
  const {
    positionLookup: posLookup,
    selectedPositions,
    curAnnot: {name: annotName},
    displayCitationIds
  } = props;
  const annotObjs = [];
  const annotLookup = {};
  for (const pos of selectedPositions) {
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


function AnnotDesc({positions, annotVal, annotDesc}) {
  const rangeStr = integersToRangeString(positions);
  return <div className={style['annot-view-item']}>
    <div className={style['annot-view-value']}>{annotVal}</div>
    <div className={style['annot-view-positions']}>(POS {rangeStr})</div>
    <div className={style['annot-view-desc']}>{nl2br(annotDesc)}</div>
  </div>;
}


export default class PosAnnotViewBox extends React.Component {

  static propTypes = {
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
    if (selectedPositions.length === 0) {
      return null;
    }
    return (
      <div className={
        makeClassNames(style['input-group'], style['scrollable'])
      }>
        <label>Annotations of selected positions:</label>
        {annotObjs.map((annotation, idx) => (
          <AnnotDesc key={idx} {...annotation} />
        ))}
        {annotObjs.length === 0 ? "None" : null}
      </div>
    );
  }

}
