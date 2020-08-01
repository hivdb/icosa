import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';
import {annotShape, posShape} from '../../prop-types';


export default class PositionItem extends React.Component {

  static propTypes = {
    size: PropTypes.oneOf(['large', 'middle', 'small']).isRequired,
    position: PropTypes.number.isRequired,
    curAnnot: annotShape,
    posAnnot: posShape,
    prevPosAnnot: posShape,
    postPosAnnot: posShape,
    residue: PropTypes.string.isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    active: PropTypes.bool.isRequired
  }

  static getPosHighlight(curAnnot, posAnnot, displayCitationIds) {
    if (!posAnnot || !curAnnot) {
      return null;
    }
    const {
      name: annotName,
      level
    } = curAnnot;
    if (level === 'amino acid') {
      return null;
    }
    for (const {name, value, citationIds} of posAnnot.annotations) {
      if (name !== annotName) {
        continue;
      }
      if (!citationIds.some(citeId => displayCitationIds.includes(citeId))) {
        continue;
      }
      return value;
    }
    return null;
  }

  get posHighlight() {
    const {curAnnot, posAnnot, displayCitationIds} = this.props;
    return this.constructor.getPosHighlight(
      curAnnot, posAnnot, displayCitationIds
    );
  }

  get isAnnotStart() {
    const {curAnnot, prevPosAnnot, posAnnot, displayCitationIds} = this.props;
    const prevAnnotVal = this.constructor.getPosHighlight(
      curAnnot, prevPosAnnot, displayCitationIds
    );
    const annotVal = this.constructor.getPosHighlight(
      curAnnot, posAnnot, displayCitationIds
    );
    return annotVal !== null && prevAnnotVal !== annotVal;
  }

  get isAnnotEnd() {
    const {curAnnot, postPosAnnot, posAnnot, displayCitationIds} = this.props;
    const postAnnotVal = this.constructor.getPosHighlight(
      curAnnot, postPosAnnot, displayCitationIds
    );
    const annotVal = this.constructor.getPosHighlight(
      curAnnot, posAnnot, displayCitationIds
    );
    return annotVal !== null && postAnnotVal !== annotVal;
  }

  get aaHighlights() {
    const {posAnnot, curAnnot, displayCitationIds} = this.props;
    if (!posAnnot || !curAnnot) {
      return [];
    }
    const {name: annotName, level} = curAnnot;
    if (level === 'position') {
      return [];
    }
    const aas = [];
    for (const {aminoAcid, annotations} of posAnnot.aminoAcids) {
      for (const {name, citationIds} of annotations) {
        if (name !== annotName) {
          continue;
        }
        if (!citationIds.some(citeId => displayCitationIds.includes(citeId))) {
          continue;
        }
        aas.push(aminoAcid);
      }
    }
    return aas;
  }

  render() {
    const {
      size, position, residue, active,
      curAnnot: {level: annotLevel} = {}
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
