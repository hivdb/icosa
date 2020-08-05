import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import xor from 'lodash/xor';
import range from 'lodash/range';
import union from 'lodash/union';

import PositionItem from './position-item';
import style from './style.module.scss';

import {annotShape, posShape, seqViewerSizeType} from '../../prop-types';


function getPositionFromTarget(target) {
  if (!target || !target.dataset) {
    return;
  }
  let {selectable, position} = target.dataset;
  if (selectable !== "true" || !position) {
    return;
  }
  position = parseInt(position);
  if (isNaN(position)) {
    return;
  }
  return position;
}


function rangePos(start, end) {
  if (start > end) {
    [end, start] = [start, end];
  }
  return range(start, end + 1);
}


function xorSelections(curSels, prevSels, newSels) {
  const combined = xor(xor(curSels, prevSels), newSels);
  return combined.sort();
}


function unionSelections(curSels, prevSels, newSels) {
  const combined = union(xor(curSels, prevSels), newSels);
  return combined.sort();
}


function getKeyCmd({ctrlKey, metaKey, shiftKey}, annotLevel) {
  if (annotLevel === 'amino acid') {
    return {multiSel: false, rangeSel: false};
  }
  let multiSel = ctrlKey || metaKey;
  let rangeSel = shiftKey;
  if (multiSel && rangeSel) {
    multiSel = rangeSel = false;
  }
  return {multiSel, rangeSel};
}


export default class SequenceViewer extends React.Component {

  static propTypes = {
    size: seqViewerSizeType.isRequired,
    className: PropTypes.string,
    curAnnot: annotShape,
    sequence: PropTypes.string.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired
  }

  /* static getDerivedStateFromProps(props, state) {
    const {selectedPositions} = props;
    if (selectedPositions.length === 0) {
      return {
        mouseDown: false,
        activePos: false,
        prevSelecteds: []
      };
    }
    return null;
  } */

  constructor() {
    super(...arguments);
    this.state = {
      mouseDown: false,
      activePos: false,
      prevSelecteds: []
    };
    this.posItemRefs = [];
    const seqLen = this.props.sequence.length;
    for (let pos0 = 0; pos0 < seqLen; pos0 ++) {
      this.posItemRefs.push(createRef());
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleGlobalKeyDown, false);
    document.addEventListener('keyup', this.handleGlobalKeyUp, false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
    document.removeEventListener('keyup', this.handleGlobalKeyUp);
  }

  setSelection(selecteds) {
    if (selecteds.length === 0) {
      this.setState({
        mouseDown: false,
        activePos: false,
        prevSelecteds: []
      });
    }
    this.props.onChange(selecteds);
  }

  get numPosPerRow() {
    let firstRowTop, numPos = 0;
    for (const elemRef of this.posItemRefs) {
      const rect = elemRef.current.getBoundingClientRect();
      if (numPos === 0) {
        numPos = 1;
        firstRowTop = rect.top;
      }
      else if (Math.abs(rect.top - firstRowTop) < 1) {
        // allow <1px error
        numPos += 1;
      }
      else {
        break;
      }
    }
    return numPos;
  }

  get numPosPerPage() {
    return this.numPosPerRow * 10;
  }

  handleGlobalKeyDown = (evt) => {
    const {key} = evt;
    switch (key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'Home':
      case 'PageUp':
      case 'PageDown':
        if (document.activeElement.tagName === 'BODY') {
          evt.stopPropagation();
          evt.preventDefault();
          this.posItemRefs[0].current.focus();
        }
        break;
      case 'End':
        if (document.activeElement.tagName === 'BODY') {
          evt.stopPropagation();
          evt.preventDefault();
          this.posItemRefs[this.posItemRefs.length - 1].current.focus();
        }
        break;
      default:
        // pass
    }
  }

  handleGlobalKeyUp = (evt) => {
    const {key} = evt;
    switch (key) {
      case 'Tab':
        setTimeout(() => {
          const {activeElement} = document;
          const pos = getPositionFromTarget(activeElement);
          if (pos) {
            this.setState({
              activePos: pos
            });
          }
        }, 0);
        break;
      case 'Escape':
        this.setSelection([]);
        break;
      default:
        // pass
    }
  }

  handleDirectionKeyDown = ({currentTarget, key}) => {
    const {numPosPerRow, numPosPerPage} = this;
    const {sequence} = this.props;
    const maxPos = sequence.length;
    let endPos = getPositionFromTarget(currentTarget);
    switch(key) {
      case 'ArrowLeft':
        endPos --;
        break;
      case 'ArrowRight':
        endPos ++;
        break;
      case 'ArrowUp':
        endPos -= numPosPerRow;
        break;
      case 'ArrowDown':
        endPos += numPosPerRow;
        break;
      case 'Home':
        endPos = 1;
        break;
      case 'End':
        endPos = maxPos;
        break;
      case 'PageUp':
        endPos -= numPosPerPage;
        if (endPos < 1) {
          endPos = 1;
        }
        break;
      case 'PageDown':
        endPos += numPosPerPage;
        if (endPos > maxPos) {
          endPos = maxPos;
        }
        break;
      default:
        // pass
    }
    if (endPos < 1 || endPos > maxPos) {
      return;
    }
    this.posItemRefs[endPos - 1].current.focus();
  }

  handleDirectionKeyUp = ({currentTarget, shiftKey: rangeSel, key}) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {activePos} = this.state;
    const endPos = getPositionFromTarget(currentTarget);
    if (annotLevel === 'position' && rangeSel) {
      let selecteds = rangePos(activePos, endPos);
      selecteds = union(this.props.selectedPositions, selecteds);
      this.setSelection(selecteds);
    }
    else {
      this.setState({activePos: endPos});
    }
  }

  handleToggleSelect = ({currentTarget}) => {
    const endPos = getPositionFromTarget(currentTarget);
    const {curAnnot: {level: annotLevel}} = this.props;
    let selected;
    if (annotLevel === 'position') {
      const {selectedPositions} = this.props;
      selected = xor(selectedPositions, [endPos]);
    }
    else {
      selected = [endPos];
    }
    this.setState({activePos: endPos, prevSelecteds: []});
    this.setSelection(selected);
  }

  handleMouseDown = (evt) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {multiSel, rangeSel} = getKeyCmd(evt, annotLevel);
    let {activePos, prevSelecteds} = this.state;
    const position = getPositionFromTarget(evt.target);
    if (!position) {
      return;
    }
    let selecteds = [position];
    if (rangeSel && activePos) {
      selecteds = rangePos(activePos, position);
    }
    else if (!rangeSel) {
      prevSelecteds = [];
    }
    this.setState({
      mouseDown: position,
      prevSelecteds: selecteds
    });
    if (multiSel) {
      selecteds = xorSelections(
        this.props.selectedPositions,
        prevSelecteds,
        selecteds
      );
    }
    if (rangeSel) {
      selecteds = unionSelections(
        this.props.selectedPositions,
        prevSelecteds,
        selecteds
      );
    }
    this.setSelection(selecteds);
  }

  handleMouseMove = (evt) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {multiSel, rangeSel} = getKeyCmd(evt, annotLevel);
    const {mouseDown, activePos, prevSelecteds} = this.state;
    if (!mouseDown || annotLevel === 'amino acid') {
      return;
    }
    let posStart = mouseDown;
    if (rangeSel && activePos) {
      posStart = activePos;
    }
    const posEnd = getPositionFromTarget(evt.target);
    if (!posEnd) {
      return;
    }
    let selecteds = rangePos(posStart, posEnd);
    this.setState({prevSelecteds: selecteds});
    if (multiSel) {
      selecteds = xorSelections(
        this.props.selectedPositions,
        prevSelecteds,
        selecteds
      );
    }
    if (rangeSel) {
      selecteds = unionSelections(
        this.props.selectedPositions,
        prevSelecteds,
        selecteds
      );
    }
    this.setSelection(selecteds);
  }

  handleMouseUp = (evt) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {multiSel, rangeSel} = getKeyCmd(evt, annotLevel);
    const {mouseDown, activePos, prevSelecteds} = this.state;
    this.setState({mouseDown: false});
    if (!mouseDown || annotLevel === 'amino acid') {
      return;
    }
    let posStart = mouseDown;
    const posEnd = getPositionFromTarget(evt.target);
    if (!posEnd) {
      return;
    }
    if (rangeSel && activePos) {
      posStart = activePos;
    }
    else {
      this.setState({activePos: posEnd});
    }
    let selecteds = rangePos(posStart, posEnd);
    if (multiSel) {
      selecteds = xorSelections(
        this.props.selectedPositions,
        prevSelecteds,
        selecteds
      );
    }
    if (rangeSel) {
      selecteds = unionSelections(
        this.props.selectedPositions,
        prevSelecteds,
        selecteds
      );
    }
    this.setSelection(selecteds);
  }

  render() {
    const {
      className, sequence, size,
      curAnnot, selectedPositions,
      displayCitationIds,
      positionLookup
    } = this.props;
    const combinedClassName = makeClassNames(
      style['sequence-viewer'], className
    );

    return (
      <div
       onMouseDown={this.handleMouseDown}
       onMouseMove={this.handleMouseMove}
       onMouseUp={this.handleMouseUp}
       className={combinedClassName}>
        {Array.from(sequence).map((residue, pos0) => (
          <PositionItem
           key={pos0} size={size}
           selectableRef={this.posItemRefs[pos0]}
           curAnnot={curAnnot}
           onDirectionKeyUp={this.handleDirectionKeyUp}
           onDirectionKeyDown={this.handleDirectionKeyDown}
           onToggleSelect={this.handleToggleSelect}
           active={selectedPositions.includes(pos0 + 1)}
           posAnnot={positionLookup[pos0 + 1]}
           prevPosAnnot={positionLookup[pos0]}
           postPosAnnot={positionLookup[pos0 + 2]}
           displayCitationIds={displayCitationIds}
           position={pos0 + 1} residue={residue} />
        ))}
      </div>
    );
  }

}
