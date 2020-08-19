import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {Stage} from 'react-konva';
import xor from 'lodash/xor';
import range from 'lodash/range';
import union from 'lodash/union';
import debounce from 'lodash/debounce';

import style from './style.module.scss';
import PosItemLayer from './positem-layer';
import SelectedLayer from './selected-layer';
import ExtraAnnotsLayer from './extra-annots-layer';
import HoverLayer from './hover-layer';

import {annotShape, posShape} from '../../prop-types';


function rangePos(start, end) {
  if (start > end) {
    [end, start] = [start, end];
  }
  return range(start, end + 1);
}


function unionSelections(curSels, prevSels, newSels) {
  const combined = union(xor(curSels, prevSels), newSels);
  return combined.sort((a, b) => a - b);
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


export default class SeqViewerStage extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    curAnnot: annotShape,
    extraAnnots: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
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
        mouseMoved: false,
        activePos: null,
        prevSelecteds: []
      };
    }
    return null;
  } */

  constructor() {
    super(...arguments);
    this.state = {
      mouseDown: false,
      mouseMoved: false,
      anchorPos: null,
      activePos: null,
      hoverPos: null,
      curSelecteds: this.props.selectedPositions,
      prevSelecteds: []
    };
    this.posItemRefs = [];
    const seqLen = this.props.sequence.length;
    for (let pos0 = 0; pos0 < seqLen; pos0 ++) {
      this.posItemRefs.push(createRef());
    }
    this.containerRef = createRef();
  }

  scrollToPos = (position) => {
    const {config: {
      posItemOuterHeightPixel: posItemHeight,
      verticalMarginPixel: vMargin,
      pos2Coord
    }} = this.props;
    const {y: posOffsetY} = pos2Coord(position);
    const {pageYOffset, innerHeight: viewportHeight} = window;
    const rect = this.containerRef.current.getBoundingClientRect();
    
    const posItemTop = rect.y + posOffsetY;
    const posItemBottom = posItemTop + posItemHeight;

    if (posItemTop < vMargin) {
      window.scrollTo({top: pageYOffset + posItemTop - vMargin});
    }
    else if (posItemBottom > viewportHeight) {
      window.scrollTo({
        top: pageYOffset + posItemBottom - viewportHeight
      });
    }
  }

  getPositionFromMouseEvent(event) {
    const {offsetX, offsetY} = event;
    return this.props.config.coord2Pos(offsetX, offsetY);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleGlobalKeyDown, false);
    document.addEventListener('keyup', this.handleGlobalKeyUp, false);
  }

  componentDidUpdate(prevProps, prevState) {
    const {activePos} = this.state;
    if (prevState.activePos !== activePos) {
      this.scrollToPos(activePos);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
    document.removeEventListener('keyup', this.handleGlobalKeyUp);
  }

  setSelection(selecteds) {
    if (selecteds.length === 0) {
      this.setState({
        mouseDown: false,
        mouseMoved: false,
        activePos: null,
        anchorPos: null,
        curSelecteds: [],
        prevSelecteds: []
      });
    }
    else {
      this.setState({
        curSelecteds: selecteds
      });
    }
    this.props.onChange(selecteds);
  }

  handleGlobalKeyDown = (evt) => {
    const {key} = evt;
    let endPos = this.state.activePos;
    const isBodyActive = document.activeElement.tagName === 'BODY';
    switch (key) {
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'PageUp':
      case 'PageDown':
      case 'Home':
        if (isBodyActive && endPos) {
          this.handleKeyDown(evt);
          return;
        }
        if (isBodyActive) {
          endPos = endPos || 1;
          break;
        }
        else {
          return;
        }
      case 'End':
        if (isBodyActive) {
          endPos = this.props.sequence.length;
          break;
        }
        else {
          return;
        }
      default:
        return;
    }
    evt.stopPropagation();
    evt.preventDefault();
    this.setState({
      activePos: endPos,
      anchorPos: endPos
    });
    this.setSelection([endPos]);
    this.containerRef.current.focus();
  }

  handleGlobalKeyUp = (evt) => {
    const {key} = evt;
    switch (key) {
      case 'Tab':
        setTimeout(() => {
          if (
            !this.state.anchorPos &&
            document.activeElement === this.containerRef.current
          ) {
            this.setState({
              activePos: 1,
              anchorPos: 1
            });
            this.setSelection([1]);
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

  handleKeyDown = (evt) => {
    const {key, shiftKey: rangeSel} = evt;
    const {numCols, numPosPerPage} = this.props.config;
    const {sequence} = this.props;
    const maxPos = sequence.length;
    let endPos = this.state.activePos;
    switch(key) {
      case 'ArrowLeft':
        endPos --;
        break;
      case 'ArrowRight':
        endPos ++;
        break;
      case 'ArrowUp':
        endPos -= numCols;
        break;
      case 'ArrowDown':
        endPos += numCols;
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
        return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    if (endPos < 1 || endPos > maxPos) {
      return;
    }
    const nextState = {
      activePos: endPos,
      anchorPos: this.state.anchorPos
    };
    if (!rangeSel) {
      nextState.anchorPos = endPos;
    }
    this.setState(nextState);
    this.handleKeySelection(rangeSel, nextState);
  }

  handleKeySelection = debounce((rangeSel, nextState) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {anchorPos, activePos: endPos} = nextState;
    if (annotLevel === 'position' && rangeSel) {
      let selecteds = rangePos(anchorPos, endPos);
      const {prevSelecteds} = this.state;
      this.setState({prevSelecteds: selecteds});
      selecteds = unionSelections(
        this.props.selectedPositions,
        prevSelecteds, selecteds);
      this.setSelection(selecteds);
    }
    else {
      const selecteds = [endPos];
      this.setState({prevSelecteds: selecteds});
      this.setSelection(selecteds);
    }
  },50)

  /*handleToggleSelect = ({currentTarget}) => {
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
  }*/

  handleMouseDown = ({evt}) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {multiSel, rangeSel} = getKeyCmd(evt, annotLevel);
    let {anchorPos, prevSelecteds} = this.state;
    const position = this.getPositionFromMouseEvent(evt);
    if (!position) {
      return;
    }
    let selecteds = [position];
    if (rangeSel && anchorPos) {
      selecteds = rangePos(anchorPos, position);
    }
    else {
      this.setState({
        activePos: position,
        anchorPos: position
      });
      if (!rangeSel) {
        prevSelecteds = [];
      }
    }
    this.setState({
      mouseDown: position,
      prevSelecteds: selecteds
    });
    if (multiSel) {
      selecteds = unionSelections(
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

  handleMouseMove = ({evt}) => {
    // set hovering position
    const hoverPos = this.getPositionFromMouseEvent(evt);
    this.setState({hoverPos});
    // end

    const {curAnnot: {level: annotLevel}} = this.props;
    const {multiSel, rangeSel} = getKeyCmd(evt, annotLevel);
    const {mouseDown, anchorPos, prevSelecteds} = this.state;
    if (!mouseDown || annotLevel === 'amino acid') {
      return;
    }
    let posStart = mouseDown;
    if (rangeSel && anchorPos) {
      posStart = anchorPos;
    }
    const posEnd = hoverPos;
    if (!posEnd) {
      return;
    }
    let selecteds = rangePos(posStart, posEnd);
    this.setState({
      prevSelecteds: selecteds,
      activePos: posEnd,
      mouseMoved: true
    });
    if (multiSel) {
      selecteds = unionSelections(
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

  handleMouseUp = ({evt}) => {
    const {curAnnot: {level: annotLevel}} = this.props;
    const {multiSel, rangeSel} = getKeyCmd(evt, annotLevel);
    const {mouseDown, mouseMoved, anchorPos, prevSelecteds} = this.state;
    this.setState({
      mouseDown: false,
      mouseMoved: false
    });
    if (!mouseDown || !mouseMoved) {
      return;
    }
    let posStart = mouseDown;
    const posEnd = this.getPositionFromMouseEvent(evt);
    if (!posEnd) {
      return;
    }
    if (annotLevel === 'amino acid') {
      // this.setState({activePos: posEnd, anchorPos: posEnd});
      return;
    }
    if (rangeSel && anchorPos) {
      posStart = anchorPos;
    }
    let selecteds = rangePos(posStart, posEnd);
    this.setState({activePos: posEnd});
    if (multiSel) {
      selecteds = unionSelections(
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
      config, sequence,
      positionLookup
    } = this.props;
    const {
      hoverPos,
      anchorPos,
      activePos,
      // the internal "curSelecteds" is much faster
      // than this.props.selectedPositions
      curSelecteds
    } = this.state;
    
    return (
      <div
       ref={this.containerRef}
       className={style['stage-container']}
       tabIndex="0"
       onKeyDown={this.handleKeyDown}
       onKeyUp={this.handleKeyUp}>
        <Stage
         width={config.canvasWidthPixel}
         onMouseDown={this.handleMouseDown}
         onMouseMove={this.handleMouseMove}
         onMouseOut={this.handleMouseMove}
         onMouseUp={this.handleMouseUp}
         height={config.canvasHeightPixel}>
          <ExtraAnnotsLayer {...{config}} />
          <PosItemLayer
           sequence={sequence}
           config={config}
           positionLookup={positionLookup} />
          <HoverLayer
           hoverPos={hoverPos}
           activePos={activePos}
           anchorPos={anchorPos}
           config={config} />
          <SelectedLayer
           selectedPositions={curSelecteds}
           anchorPos={anchorPos}
           config={config} />
        </Stage>
      </div>
    );
  }

}