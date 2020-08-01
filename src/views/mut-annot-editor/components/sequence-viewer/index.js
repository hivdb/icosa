import React from 'react';
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


function getKeyCmd({ctrlKey, metaKey, shiftKey}) {
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

  static getDerivedStateFromProps(props, state) {
    const {selectedPositions} = props;
    if (selectedPositions.length === 0) {
      return {
        mouseDown: false,
        mouseUpPos: false,
        prevSelecteds: []
      };
    }
    return null;
  }

  constructor() {
    super(...arguments);
    this.state = {
      mouseDown: false,
      mouseUpPos: false,
      prevSelecteds: []
    };
  }

  setSelection(selecteds) {
    if (selecteds.length === 0) {
      this.setState({
        mouseDown: false,
        mouseUpPos: false,
        prevSelecteds: []
      });
    }
    this.props.onChange(selecteds);
  }

  handleMouseDown = (evt) => {
    const {multiSel, rangeSel} = getKeyCmd(evt);
    let {mouseUpPos, prevSelecteds} = this.state;
    const position = getPositionFromTarget(evt.target);
    if (!position) {
      return;
    }
    let selecteds = [position];
    if (rangeSel && mouseUpPos) {
      selecteds = rangePos(mouseUpPos, position);
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
    const {multiSel, rangeSel} = getKeyCmd(evt);
    const {mouseDown, mouseUpPos, prevSelecteds} = this.state;
    if (!mouseDown) {
      return;
    }
    let posStart = mouseDown;
    if (rangeSel && mouseUpPos) {
      posStart = mouseUpPos;
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
    const {multiSel, rangeSel} = getKeyCmd(evt);
    const {mouseDown, mouseUpPos, prevSelecteds} = this.state;
    this.setState({mouseDown: false});
    if (!mouseDown) {
      if (!multiSel && !rangeSel) {
        this.setSelection([]);
      }
      return;
    }
    let posStart = mouseDown;
    const posEnd = getPositionFromTarget(evt.target);
    if (!posEnd) {
      return;
    }
    if (rangeSel && mouseUpPos) {
      posStart = mouseUpPos;
    }
    else {
      this.setState({mouseUpPos: posEnd});
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
           curAnnot={curAnnot}
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
