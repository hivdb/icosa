import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';
import {annotShape, posShape} from '../../prop-types';


function AA({aa}) {
  let inner = aa;
  if (aa === 'i') {
    inner = <em title="insertion">ins</em>;
  }
  else if (aa === 'd') {
    inner = <em title="deletion">del</em>;
  }
  return (
    <div className={style['amino-acid']}>
      {inner}
    </div>
  );
}


export default class PositionItem extends React.Component {

  static propTypes = {
    selectableRef: PropTypes.object.isRequired,
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
    onArrowKeyDown: PropTypes.func.isRequired,
    onArrowKeyUp: PropTypes.func.isRequired,
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

  handleKeyDown = evt => {
    const {onArrowKeyDown} = this.props;
    if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(evt.key)) {
      evt.stopPropagation();
      evt.preventDefault();
      onArrowKeyDown(evt);
    }
  }

  handleKeyUp = evt => {
    const {onArrowKeyUp} = this.props;
    if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(evt.key)) {
      onArrowKeyUp(evt);
    }
  }

  render() {
    const {
      selectableRef, size, position, residue,
      active, curAnnot: {level: annotLevel} = {}
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
         ref={selectableRef}
         tabIndex="0"
         onKeyDown={this.handleKeyDown}
         onKeyUp={this.handleKeyUp}
         className={style['position-item-box']}
         data-selectable="true"
         data-position={position}>
          {residue}
        </div>
        {annotLevel === 'amino acid' ?
          <div className={style['position-item-amino-acids']}>
            {aaHighlights.map(aa => (
              <AA aa={aa} />
            ))}
          </div> : null}
      </div>
    );

  }

}
