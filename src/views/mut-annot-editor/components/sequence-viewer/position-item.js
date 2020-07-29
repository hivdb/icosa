import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';
import {annotShape, posShape} from '../../prop-types';


export default class PositionItem extends React.Component {

  static propTypes = {
    size: PropTypes.oneOf(['large', 'middle', 'small']).isRequired,
    position: PropTypes.number.isRequired,
    curAnnot: annotShape.isRequired,
    posAnnot: posShape,
    prevPosAnnot: posShape,
    postPosAnnot: posShape,
    residue: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired
  }

  static getPosHighlight(curAnnot, posAnnot) {
    if (!posAnnot) {
      return null;
    }
    const {
      name: annotName,
      level
    } = curAnnot;
    if (level === 'amino acid') {
      return null;
    }
    for (const {name, value} of posAnnot.annotations) {
      if (name === annotName) {
        return value;
      }
    }
    return null;
  }

  get posHighlight() {
    const {curAnnot, posAnnot} = this.props;
    return this.constructor.getPosHighlight(curAnnot, posAnnot);
  }

  get isAnnotStart() {
    const {curAnnot, prevPosAnnot, posAnnot} = this.props;
    const prevAnnotVal = this.constructor.getPosHighlight(
      curAnnot, prevPosAnnot
    );
    const annotVal = this.constructor.getPosHighlight(curAnnot, posAnnot);
    return annotVal !== null && prevAnnotVal !== annotVal;
  }

  get isAnnotEnd() {
    const {curAnnot, postPosAnnot, posAnnot} = this.props;
    const postAnnotVal = this.constructor.getPosHighlight(
      curAnnot, postPosAnnot
    );
    const annotVal = this.constructor.getPosHighlight(curAnnot, posAnnot);
    return annotVal !== null && postAnnotVal !== annotVal;
  }

  get aaHighlights() {
    const {posAnnot} = this.props;
    if (!posAnnot) {
      return [];
    }
    const {
      curAnnot: {
        name: annotName,
        level
      }
    } = this.props;
    if (level === 'position') {
      return [];
    }
    const aas = [];
    for (const {aminoAcid, annotations} of posAnnot.aminoAcids) {
      for (const {name} of annotations) {
        if (name === annotName) {
          aas.push(aminoAcid);
        }
      }
    }
    return aas;
  }

  get shouldHighlight() {
    const {posAnnot} = this.props;
    if (!posAnnot) {
      return false;
    }
    const {
      curAnnot: {
        name: annotName,
        level
      }
    } = this.props;
    if (level === 'position') {
      return posAnnot.annotations.some(({name}) => name === annotName);
    }
    else {
      return posAnnot.aminoAcids.some(({annotations}) => (
        annotations.some(({name}) => name === annotName)
      ));
    }
  }

  render() {
    const {
      size, position, residue, active,
      curAnnot: {level: annotLevel}
    } = this.props;
    const {
      posHighlight, aaHighlights,
      isAnnotStart, isAnnotEnd
    } = this;
    const highlight = !!(posHighlight || aaHighlights.length > 0);

    return (
      <div
       className={style[`position-item-${size}`]}
       onContextMenu={evt => evt.preventDefault()}
       data-active={active}
       data-highlight={highlight}
       data-is-annot-start={isAnnotStart}
       data-is-annot-end={isAnnotEnd}
       data-pos-annot-value={posHighlight}
       data-position={position} data-residue={residue}>
        {annotLevel === 'position' ?
          <div className={style['position-item-annot-range']}>
            <span className={style.left} />
            <span className={style.right} />
          </div> : null}
        <div
         className={style['position-item-box']}
         data-selectable="true"
         data-position={position}>
          {residue}
        </div>
      </div>
    );

  }

}
