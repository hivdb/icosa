import React from 'react';
import PropTypes from 'prop-types';
import {Stage} from 'react-konva';
import xor from 'lodash/xor';
import range from 'lodash/range';
import union from 'lodash/union';
import debounce from 'lodash/debounce';

import style from './style.module.scss';
import PosItemLayer from './positem-layer';
import SelectedLayer from './selected-layer';
import AnnotsLayer from './annots-layer';
import HoverLayer from './hover-layer';

import {posShape} from '../../prop-types';


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


function getKeyCmd({ctrlKey, metaKey, shiftKey}) {
  let multiSel = ctrlKey || metaKey;
  let rangeSel = shiftKey;
  if (multiSel && rangeSel) {
    multiSel = rangeSel = false;
  }
  return {multiSel, rangeSel};
}


function useSelectionState({selectedPositions, onChange}) {
  const [mouseDown, setMouseDown] = React.useState(false);
  const [mouseMoved, setMouseMoved] = React.useState(false);
  const [anchorPos, setAnchorPos] = React.useState(null);
  const [activePos, setActivePos] = React.useState(null);
  const [hoverPos, setHoverPos] = React.useState(null);
  const [hoverUSAnnot, setHoverUSAnnot] = React.useState({});
  const [curSelecteds, setCurSelecteds] = React.useState(selectedPositions);
  const [prevSelecteds, setPrevSelecteds] = React.useState([]);

  const setSelection = React.useCallback(
    ({
      mouseDown,
      mouseMoved,
      anchorPos,
      activePos,
      hoverPos,
      hoverUSAnnot,
      curSelecteds,
      prevSelecteds,
      reset
    }) => {
      if (reset || (curSelecteds && curSelecteds.length === 0)) {
        setMouseDown(false);
        setMouseMoved(false);
        setActivePos(null);
        setAnchorPos(null);
        setCurSelecteds([]);
        setPrevSelecteds([]);
      }
      else {
        mouseDown === undefined || setMouseDown(mouseDown);
        mouseMoved === undefined || setMouseMoved(mouseMoved);
        anchorPos === undefined || setAnchorPos(anchorPos);
        activePos === undefined || setActivePos(activePos);
        hoverPos === undefined || setHoverPos(hoverPos);
        hoverUSAnnot === undefined || setHoverUSAnnot(hoverUSAnnot);
        curSelecteds === undefined || setCurSelecteds(curSelecteds);
        prevSelecteds === undefined || setPrevSelecteds(prevSelecteds);
      }
      curSelecteds === undefined || onChange(curSelecteds);
    },
    [onChange]
  );

  return [
    {
      mouseDown,
      mouseMoved,
      anchorPos,
      activePos,
      hoverPos,
      hoverUSAnnot,
      curSelecteds,
      prevSelecteds
    },
    setSelection
  ];
}


function useKeyboard({
  containerRef,
  config,
  selectedPositions,
  selection: {
    activePos,
    anchorPos,
    prevSelecteds
  },
  setSelection
}) {
  const handleGlobalKeyUp = React.useCallback(
    evt => {
      const {key} = evt;
      switch (key) {
        case 'Tab':
          setTimeout(() => {
            if (
              !anchorPos &&
              document.activeElement === containerRef.current
            ) {
              setSelection({
                activePos: 1,
                anchorPos: 1,
                curSelecteds: [1]
              });
            }
            else {
              setSelection({reset: true});
            }
          }, 0);
          break;
        case 'Escape':
          setSelection({reset: true});
          break;
        default:
          // pass
      }
    },
    [setSelection, anchorPos, containerRef]
  );

  const handleKeySelection = React.useMemo(
    () => debounce((rangeSel, nextState) => {
      const {anchorPos, activePos: posEnd} = nextState;
      const newSel = {};
      if (rangeSel) {
        let selecteds = rangePos(anchorPos, posEnd);
        newSel.prevSelecteds = selecteds;
        selecteds = unionSelections(
          selectedPositions,
          prevSelecteds,
          selecteds
        );
        newSel.curSelecteds = selecteds;
      }
      else {
        const selecteds = [posEnd];
        newSel.prevSelecteds = selecteds;
        newSel.curSelecteds = selecteds;
      }
      setSelection(newSel);
    }, 50),
    [prevSelecteds, selectedPositions, setSelection]
  );

  const handleKeyDown = React.useCallback(
    evt => {
      const {key, shiftKey: rangeSel} = evt;
      const {
        numCols, numPosPerPage,
        seqFragment: [absPosStart, absPosEnd]
      } = config;
      let posEnd = activePos;
      switch (key) {
        case 'ArrowLeft':
          posEnd --;
          break;
        case 'ArrowRight':
          posEnd ++;
          break;
        case 'ArrowUp':
          posEnd -= numCols;
          break;
        case 'ArrowDown':
          posEnd += numCols;
          break;
        case 'Home':
          posEnd = 1;
          break;
        case 'End':
          posEnd = absPosEnd;
          break;
        case 'PageUp':
          posEnd -= numPosPerPage;
          if (posEnd < absPosStart) {
            posEnd = absPosStart;
          }
          break;
        case 'PageDown':
          posEnd += numPosPerPage;
          if (posEnd > absPosEnd) {
            posEnd = absPosEnd;
          }
          break;
        default:
          return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      if (posEnd < absPosStart || posEnd > absPosEnd) {
        return;
      }
      const newSel = {
        activePos: posEnd,
        anchorPos
      };
      if (!rangeSel) {
        newSel.anchorPos = posEnd;
      }
      setSelection(newSel);
      handleKeySelection(rangeSel, newSel);
    },
    [config, handleKeySelection, setSelection, activePos, anchorPos]
  );

  const handleGlobalKeyDown = React.useCallback(
    evt => {
      const {key} = evt;
      const {
        seqFragment: [absPosStart, absPosEnd]
      } = config;
      let posEnd = activePos;
      const isBodyActive = document.activeElement.tagName === 'BODY';
      switch (key) {
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'PageUp':
        case 'PageDown':
        case 'Home':
          if (isBodyActive && posEnd) {
            handleKeyDown(evt);
            return;
          }
          if (isBodyActive) {
            posEnd = posEnd || absPosStart;
            break;
          }
          else {
            return;
          }
        case 'End':
          if (isBodyActive) {
            posEnd = absPosEnd;
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
      setSelection({
        activePos: posEnd,
        anchorPos: posEnd,
        curSelecteds: [posEnd]
      });
      containerRef.current.focus();
    },
    [config, handleKeyDown, setSelection, activePos, containerRef]
  );

  React.useEffect(
    () => {
      document.addEventListener('keydown', handleGlobalKeyDown, false);
      document.addEventListener('keyup', handleGlobalKeyUp, false);
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, false);
        document.removeEventListener('keyup', handleGlobalKeyUp, false);
      };
    },
    [handleGlobalKeyDown, handleGlobalKeyUp]
  );

  return {handleKeyDown};
}


function useMouse({
  config,
  selectedPositions,
  noBlurSelector,
  selection: {
    mouseDown,
    mouseMoved,
    anchorPos,
    prevSelecteds,
    curSelecteds
  },
  setSelection
}) {
  const getPositionFromMouseEvent = React.useCallback(
    event => {
      const {offsetX, offsetY} = event;
      return config.coord2Pos(offsetX, offsetY);
    },
    [config]
  );

  const getUnderscoreAnnotNameFromMouseEvent = React.useCallback(
    event => {
      const {offsetX, offsetY} = event;
      return config.coord2UnderscoreAnnot(offsetX, offsetY);
    },
    [config]
  );

  const handleMouseDown = React.useCallback(
    ({evt}) => {
      let myPrevSelecteds = prevSelecteds;
      const {multiSel, rangeSel} = getKeyCmd(evt);
      const position = getPositionFromMouseEvent(evt);
      if (!position) {
        return;
      }
      let selecteds = [position];
      const newSel = {};
      if (rangeSel && anchorPos) {
        selecteds = rangePos(anchorPos, position);
      }
      else {
        newSel.activePos = position;
        newSel.anchorPos = position;
        if (!rangeSel) {
          myPrevSelecteds = [];
        }
      }
      newSel.mouseDown = position;
      newSel.prevSelecteds = selecteds;
      if (multiSel) {
        selecteds = unionSelections(
          selectedPositions,
          myPrevSelecteds,
          selecteds
        );
      }
      if (rangeSel) {
        selecteds = unionSelections(
          selectedPositions,
          myPrevSelecteds,
          selecteds
        );
      }
      newSel.curSelecteds = selecteds;
      setSelection(newSel);
    },
    [
      anchorPos,
      prevSelecteds,
      getPositionFromMouseEvent,
      selectedPositions,
      setSelection
    ]
  );

  const handleMouseMove = React.useCallback(
    ({evt}) => {
      // set hovering position
      const hoverPos = getPositionFromMouseEvent(evt);
      const hoverUSAnnot = getUnderscoreAnnotNameFromMouseEvent(evt);
      const newSel = {
        hoverPos,
        hoverUSAnnot
      };
      // end

      const {multiSel, rangeSel} = getKeyCmd(evt);
      if (!mouseDown) {
        setSelection(newSel);
        return;
      }
      let posStart = mouseDown;
      if (rangeSel && anchorPos) {
        posStart = anchorPos;
      }
      const posEnd = hoverPos;
      if (!posEnd) {
        setSelection(newSel);
        return;
      }
      let selecteds = rangePos(posStart, posEnd);
      newSel.prevSelecteds = selecteds;
      newSel.activePos = posEnd;
      newSel.mouseMoved = true;
      if (multiSel) {
        selecteds = unionSelections(
          selectedPositions,
          prevSelecteds,
          selecteds
        );
      }
      if (rangeSel) {
        selecteds = unionSelections(
          selectedPositions,
          prevSelecteds,
          selecteds
        );
      }
      newSel.curSelecteds = selecteds;
      setSelection(newSel);
    },
    [
      getPositionFromMouseEvent,
      getUnderscoreAnnotNameFromMouseEvent,
      mouseDown,
      anchorPos,
      prevSelecteds,
      selectedPositions,
      setSelection
    ]
  );

  const handleMouseUp = React.useCallback(
    ({evt}) => {
      const {multiSel, rangeSel} = getKeyCmd(evt);
      const newSel = {
        mouseDown: false,
        mouseMoved: false
      };
      if (!mouseDown || !mouseMoved) {
        setSelection(newSel);
        return;
      }
      let posStart = mouseDown;
      const posEnd = getPositionFromMouseEvent(evt);
      if (!posEnd) {
        setSelection(newSel);
        return;
      }
      if (rangeSel && anchorPos) {
        posStart = anchorPos;
      }
      let selecteds = rangePos(posStart, posEnd);
      newSel.activePos = posEnd;
      if (multiSel) {
        selecteds = unionSelections(
          selectedPositions,
          prevSelecteds,
          selecteds
        );
      }
      if (rangeSel) {
        selecteds = unionSelections(
          selectedPositions,
          prevSelecteds,
          selecteds
        );
      }
      newSel.curSelecteds = selecteds;
      setSelection(newSel);
    },
    [
      mouseDown,
      mouseMoved,
      anchorPos,
      prevSelecteds,
      getPositionFromMouseEvent,
      selectedPositions,
      setSelection
    ]
  );

  const handleGlobalMouseDown = React.useCallback(
    evt => {
      let noBlur = evt.target.matches(noBlurSelector);
      if (!noBlur) {
        noBlur = Array.from(
          document.querySelectorAll(noBlurSelector)
        ).some(parent => parent.contains(evt.target));
      }
      if (noBlur) {
        return;
      }
      const isCanvasClicked = evt.target.tagName === 'CANVAS';
      if (!isCanvasClicked) {
        if (curSelecteds.length > 0) {
          setSelection({reset: true});
        }
      }
    },
    [noBlurSelector, curSelecteds, setSelection]
  );

  React.useEffect(
    () => {
      document.addEventListener('mousedown', handleGlobalMouseDown, false);
      return () => document.removeEventListener(
        'mousedown',
        handleGlobalMouseDown,
        false
      );
    },
    [handleGlobalMouseDown]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
}


function useAutoScroll({activePos, config, footerHeight}) {
  const containerRef = React.useRef();

  const scrollToPos = React.useCallback(
    position => {
      const {
        posItemOuterHeightPixel: posItemHeight,
        verticalMarginPixel: vMargin,
        pos2Coord
      } = config;
      const {y: posOffsetY} = pos2Coord(position);
      let {pageYOffset, innerHeight: viewportHeight} = window;
      viewportHeight -= footerHeight;
      const rect = containerRef.current.getBoundingClientRect();

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
    },
    [config, footerHeight]
  );

  React.useEffect(
    () => scrollToPos(activePos),
    [activePos, scrollToPos]
  );

  return containerRef;
}


SeqViewerStage.propTypes = {
  config: PropTypes.object.isRequired,
  sequence: PropTypes.string.isRequired,
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
  selectedPositions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  noBlurSelector: PropTypes.string.isRequired,
  footerHeight: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

SeqViewerStage.defaultProps = {
  footerHeight: 8 * 14
};

export default function SeqViewerStage({
  config,
  sequence,
  positionLookup,
  selectedPositions,
  noBlurSelector,
  footerHeight,
  onChange
}) {
  const [selection, setSelection] = useSelectionState({
    selectedPositions,
    onChange
  });

  const containerRef = useAutoScroll({
    activePos: selection.activePos,
    config,
    footerHeight
  });

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useMouse({
    config,
    selectedPositions,
    noBlurSelector,
    selection,
    setSelection
  });

  const {
    handleKeyDown
  } = useKeyboard({
    containerRef,
    config,
    selectedPositions,
    selection,
    setSelection
  });

  return (
    <div
     ref={containerRef}
     className={style['stage-container']}
     tabIndex="0"
     onKeyDown={handleKeyDown}>
      <Stage
       width={config.canvasWidthPixel}
       onMouseDown={handleMouseDown}
       onMouseMove={handleMouseMove}
       onMouseOut={handleMouseMove}
       onMouseUp={handleMouseUp}
       height={config.canvasHeightPixel}>
        <AnnotsLayer
         hoverUSAnnot={selection.hoverUSAnnot}
         {...{config}} />
        <PosItemLayer
         sequence={sequence}
         config={config}
         positionLookup={positionLookup} />
        <HoverLayer
         hoverPos={selection.hoverPos}
         hoverUSAnnot={selection.hoverUSAnnot}
         activePos={selection.activePos}
         anchorPos={selection.anchorPos}
         config={config}
         positionLookup={positionLookup} />
        <SelectedLayer
         selectedPositions={selection.curSelecteds}
         anchorPos={selection.anchorPos}
         config={config} />
      </Stage>
    </div>
  );

}
