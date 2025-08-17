import React from 'react';
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

import type {Position} from '../../prop-types';

/**
 * Create an array of integers between `start` and `end` (inclusive).
 */
export function rangePos(start: number, end: number): number[] {
  if (start > end) {
    [end, start] = [start, end];
  }
  return range(start, end + 1);
}

/**
 * Merge selections by applying an XOR with the previous selection and then
 * adding new selections. The resulting array is sorted.
 */
export function unionSelections(
  curSels: number[],
  prevSels: number[],
  newSels: number[]
): number[] {
  const combined = union(xor(curSels, prevSels), newSels);
  return combined.sort((a, b) => a - b);
}

/**
 * Determine which modifier keys are active.
 */
export function getKeyCmd({
  ctrlKey,
  metaKey,
  shiftKey
}: {
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}) {
  let multiSel = !!(ctrlKey || metaKey);
  let rangeSel = !!shiftKey;
  if (multiSel && rangeSel) {
    multiSel = rangeSel = false;
  }
  return {multiSel, rangeSel};
}


interface SelectionState {
  mouseDown: number | false;
  mouseMoved: boolean;
  anchorPos: number | null;
  activePos: number | null;
  hoverPos: number | null;
  hoverUSAnnot: Record<string, unknown>;
  curSelecteds: number[];
  prevSelecteds: number[];
}

type SetSelection = (state: Partial<SelectionState> & {reset?: boolean}) => void;

/**
 * Manage selection state for the sequence viewer.
 */
function useSelectionState({
  selectedPositions,
  onChange
}: {
  selectedPositions: number[];
  onChange: (positions: number[]) => void;
}): [SelectionState, SetSelection] {
  const [mouseDown, setMouseDown] = React.useState<number | false>(false);
  const [mouseMoved, setMouseMoved] = React.useState(false);
  const [anchorPos, setAnchorPos] = React.useState<number | null>(null);
  const [activePos, setActivePos] = React.useState<number | null>(null);
  const [hoverPos, setHoverPos] = React.useState<number | null>(null);
  const [hoverUSAnnot, setHoverUSAnnot] = React.useState<Record<string, unknown>>({});
  const [curSelecteds, setCurSelecteds] = React.useState<number[]>(selectedPositions);
  const [prevSelecteds, setPrevSelecteds] = React.useState<number[]>([]);

  const setSelection = React.useCallback<SetSelection>(state => {
    const {
      mouseDown,
      mouseMoved,
      anchorPos,
      activePos,
      hoverPos,
      hoverUSAnnot,
      curSelecteds,
      prevSelecteds,
      reset
    } = state;
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
      anchorPos === undefined || setAnchorPos(anchorPos!);
      activePos === undefined || setActivePos(activePos!);
      hoverPos === undefined || setHoverPos(hoverPos!);
      hoverUSAnnot === undefined || setHoverUSAnnot(hoverUSAnnot!);
      curSelecteds === undefined || setCurSelecteds(curSelecteds);
      prevSelecteds === undefined || setPrevSelecteds(prevSelecteds!);
    }
    if (reset) {
      onChange([]);
    }
    else if (curSelecteds !== undefined) {
      onChange(curSelecteds);
    }
  }, [onChange]);

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


/**
 * Keyboard interaction logic for the sequence viewer.
 */
function useKeyboard({
  containerRef,
  config,
  selectedPositions,
  selection: {activePos, anchorPos, prevSelecteds},
  setSelection
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  selectedPositions: number[];
  selection: SelectionState;
  setSelection: SetSelection;
}) {
  const handleGlobalKeyUp = React.useCallback(
    (evt: KeyboardEvent) => {
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
    () => debounce((rangeSel: boolean, nextState: {anchorPos: number; activePos: number}) => {
      const {anchorPos, activePos: posEnd} = nextState;
      const newSel: Partial<SelectionState> = {};
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
    (evt: KeyboardEvent) => {
      const {key, shiftKey: rangeSel} = evt;
      const {
        numCols, numPosPerPage,
        seqFragment: [absPosStart, absPosEnd]
      } = config;
      const posEndNum = activePos;
      if (posEndNum == null) {
        return;
      }
      let posEnd = posEndNum;
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
        const newSel: Partial<SelectionState> = {
          activePos: posEnd,
          anchorPos
        };
      if (!rangeSel) {
        newSel.anchorPos = posEnd;
      }
        setSelection(newSel);
        handleKeySelection(rangeSel, {anchorPos: newSel.anchorPos!, activePos: newSel.activePos!});
      },
      [config, handleKeySelection, setSelection, activePos, anchorPos]
    );

  const handleGlobalKeyDown = React.useCallback(
    (evt: KeyboardEvent) => {
      const {key} = evt;
      const {
        seqFragment: [absPosStart, absPosEnd]
      } = config;
      let posEnd = activePos;
      const isBodyActive = document.activeElement?.tagName === 'BODY';
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
      if (posEnd == null) {
        return;
      }
      setSelection({
        activePos: posEnd,
        anchorPos: posEnd,
        curSelecteds: [posEnd]
      });
      containerRef.current?.focus();
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


/**
 * Mouse interaction logic for the sequence viewer.
 *
 * @param config - Rendering configuration for coordinate calculations.
 * @param selectedPositions - Currently selected sequence positions.
 * @param noBlurSelector - CSS selector for elements that should not trigger blur.
 * @param selection - Current selection state managed by {@link useSelectionState}.
 * @param setSelection - Setter function to update selection state.
 */
function useMouse({
  config,
  selectedPositions,
  noBlurSelector,
  selection: {mouseDown, mouseMoved, anchorPos, prevSelecteds, curSelecteds},
  setSelection
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  selectedPositions: number[];
  noBlurSelector: string;
  selection: SelectionState;
  setSelection: SetSelection;
}) {
  const getPositionFromMouseEvent = React.useCallback(
    (event: {offsetX: number; offsetY: number}) => {
      const {offsetX, offsetY} = event;
      return config.coord2Pos(offsetX, offsetY);
    },
    [config]
  );

  const getUnderscoreAnnotNameFromMouseEvent = React.useCallback(
    (event: {offsetX: number; offsetY: number}) => {
      const {offsetX, offsetY} = event;
      return config.coord2UnderscoreAnnot(offsetX, offsetY);
    },
    [config]
  );

  const handleMouseDown = React.useCallback(
    ({evt}: {evt: MouseEvent}) => {
      let myPrevSelecteds = prevSelecteds;
      const {multiSel, rangeSel} = getKeyCmd(evt);
      const position = getPositionFromMouseEvent(evt);
      if (!position) {
        return;
      }
      let selecteds = [position];
      const newSel: Partial<SelectionState> = {};
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
    ({evt}: {evt: MouseEvent}) => {
      // set hovering position
      const hoverPos = getPositionFromMouseEvent(evt);
      const hoverUSAnnot = getUnderscoreAnnotNameFromMouseEvent(evt);
      const newSel: Partial<SelectionState> = {
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
    ({evt}: {evt: MouseEvent}) => {
      const {multiSel, rangeSel} = getKeyCmd(evt);
      const newSel: Partial<SelectionState> = {
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
    (evt: MouseEvent) => {
      const target = evt.target as HTMLElement;
      let noBlur = target.matches(noBlurSelector);
      if (!noBlur) {
        noBlur = Array.from(
          document.querySelectorAll(noBlurSelector)
        ).some(parent => (parent as HTMLElement).contains(target));
      }
      if (noBlur) {
        return;
      }
      const isCanvasClicked = target.tagName === 'CANVAS';
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


/**
 * Automatically scroll the viewport to keep the active position visible.
 *
 * @param activePos - Currently active sequence position.
 * @param config - Rendering configuration used to translate positions to coordinates.
 * @param footerHeight - Height of the footer, used to adjust viewport size.
 * @returns Ref to the container div that should be scrolled.
 */
function useAutoScroll({
  activePos,
  config,
  footerHeight
}: {
  activePos: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  footerHeight: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollToPos = React.useCallback(
    (position: number | null) => {
      const {
        posItemOuterHeightPixel: posItemHeight,
        verticalMarginPixel: vMargin,
        pos2Coord
      } = config;
      if (!position) {
        return;
      }
      const {y: posOffsetY} = pos2Coord(position);
      let {pageYOffset, innerHeight: viewportHeight} = window;
      viewportHeight -= footerHeight;
      const rect = containerRef.current!.getBoundingClientRect();

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

  React.useEffect(() => scrollToPos(activePos), [activePos, scrollToPos]);

  return containerRef;
}


interface SeqViewerStageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  sequence: string;
  positionLookup: Record<number, Position>;
  selectedPositions: number[];
  noBlurSelector: string;
  footerHeight?: number;
  onChange: (positions: number[]) => void;
}

/**
 * Canvas stage containing all sequence viewer layers.
 */
export default function SeqViewerStage({
  config,
  sequence,
  positionLookup,
  selectedPositions,
  noBlurSelector,
  footerHeight = 8 * 14,
  onChange
}: SeqViewerStageProps) {
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
     tabIndex={0}
     onKeyDown={e => handleKeyDown(e.nativeEvent)}>
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
         hoverPos={selection.hoverPos ?? undefined}
         hoverUSAnnot={selection.hoverUSAnnot}
         activePos={selection.activePos ?? undefined}
         anchorPos={selection.anchorPos ?? undefined}
         config={config}
         positionLookup={positionLookup} />
        <SelectedLayer
         selectedPositions={selection.curSelecteds}
         config={config} />
      </Stage>
    </div>
  );

}
