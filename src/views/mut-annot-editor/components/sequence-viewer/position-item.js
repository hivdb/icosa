import React from 'react';
import PropTypes from 'prop-types';

import CustomColors from '../../../../components/custom-colors';

import style from './style.module.scss';
import {annotShape, posShape, seqViewerSizeType} from '../../prop-types';


function AA({aa, position}) {
  let inner = aa;
  if (aa === 'i') {
    inner = <em title="insertion">ins</em>;
  }
  else if (aa === 'd') {
    inner = <em title="deletion">del</em>;
  }
  return (
    <div
     data-position={position}
     data-selectable="true"
     className={style['amino-acid']}>
      {inner}
    </div>
  );
}


export default class PositionItem extends React.Component {

  static propTypes = {
    selectableRef: PropTypes.object.isRequired,
    size: seqViewerSizeType.isRequired,
    colorScheme: PropTypes.objectOf(
      PropTypes.shape({
        border: PropTypes.string.isRequired,
        hover: PropTypes.string.isRequired,
        active: PropTypes.string.isRequired
      })
    ).isRequired,
    position: PropTypes.number.isRequired,
    curAnnot: annotShape,
    posAnnot: posShape,
    prevPosAnnot: posShape,
    postPosAnnot: posShape,
    residue: PropTypes.string.isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    onDirectionKeyDown: PropTypes.func.isRequired,
    onDirectionKeyUp: PropTypes.func.isRequired,
    onToggleSelect: PropTypes.func.isRequired,
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

  get colors() {
    const {posAnnot, curAnnot, colorScheme} = this.props;
    if (!posAnnot || !curAnnot) {
      return {};
    }
    const {name: annotName, level} = curAnnot;
    if (level !== 'position') {
      return {};
    }
    const annot = posAnnot.annotations.find(({name}) => name === annotName);
    if (!annot) {
      return {};
    }
    return colorScheme[annot.value];
    
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
    const {
      onDirectionKeyDown
    } = this.props;
    switch (evt.key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        evt.stopPropagation();
        evt.preventDefault();
        onDirectionKeyDown(evt);
        break;
      case ' ':
        evt.stopPropagation();
        evt.preventDefault();
        break;
      default:
        // pass
    }
  }

  handleKeyUp = evt => {
    const {
      curAnnot: {level},
      onDirectionKeyUp,
      onToggleSelect
    } = this.props;
    switch (evt.key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        onDirectionKeyUp(evt);
        break;
      case ' ':
        onToggleSelect(evt);
        break;
      case 'Enter':
        if (level === 'amino acid') {
          onToggleSelect(evt);
        }
        break;
      default:
        // pass
    }
  }

  render() {
    const {
      selectableRef, size, position, residue,
      active, curAnnot: {level: annotLevel} = {}
    } = this.props;
    const {
      posHighlight, aaHighlights,
      isAnnotStart, isAnnotEnd, colors
    } = this;
    const highlight = !!(posHighlight || aaHighlights.length > 0);

    return (
      <CustomColors
       as="div"
       colors={{
         'seqviewer-position-item-active-border': colors.border,
         'seqviewer-position-item-active-bg': colors.active,
         'seqviewer-position-item-hover-bg': colors.hover,
       }}
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
              <AA position={position} aa={aa} key={aa} />
            ))}
          </div> : null}
      </CustomColors>
    );

  }

}
