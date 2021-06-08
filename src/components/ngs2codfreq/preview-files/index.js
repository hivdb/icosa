import React from 'react';
import classNames from 'classnames';

import {moveFile, removeFile, splicePair} from '../fastq-pairs';
import style from '../style.module.scss';
import FASTQPairItem from './item';
import useUndoHistory from './undo-history';


function calcStep(distance) {
  let direction = 1;
  if (distance < 0) {
    direction = -1;
    distance = -distance;
  }
  return direction * Math.ceil(distance / 20);
}


export default function PreviewFiles({fastqPairs, onChange, className}) {

  const listRef = React.useRef(null);
  const [curDragFile, setCurDragFile] = React.useState(null);
  const {pushHistory} = useUndoHistory(onChange);

  React.useEffect(
    () => pushHistory(fastqPairs),
    [pushHistory, fastqPairs]
  );

  const scroll = React.useCallback(
    step => {
      listRef.current.scrollTop += step;
    },
    [listRef]
  );

  const handleDragStart = React.useCallback(
    (file, event) => {
      setCurDragFile(file);
    },
    [setCurDragFile]
  );

  const handleDrag = React.useCallback(
    event => {
      const {top, bottom} = listRef.current.getBoundingClientRect();
      const listHeight = bottom - top;
      const offsetY = event.clientY - top;
      if (offsetY < 0) {
        const step = calcStep(offsetY);
        scroll(step);
      }
      else if (offsetY > listHeight) {
        const step = calcStep(offsetY - listHeight);
        scroll(step);
      }
    },
    [scroll, listRef]
  );
  const handleDragEnd = React.useCallback(
    event => {
      setCurDragFile(null);
    },
    [setCurDragFile]
  );

  const handleSplit = React.useCallback(
    idx => {
      const newFastqPairs = splicePair(fastqPairs, idx);
      onChange(newFastqPairs);
    },
    [fastqPairs, onChange]
  );

  const handleMove = React.useCallback(
    ({src, target}) => {
      const newFastqPairs = moveFile(fastqPairs, src, target);
      onChange(newFastqPairs);
      setCurDragFile(null);
    },
    [fastqPairs, onChange]
  );

  const handleRemove = React.useCallback(
    ({index, fileName}) => {
      const newFastqPairs = removeFile(fastqPairs, index, fileName);
      onChange(newFastqPairs);
    },
    [fastqPairs, onChange]
  );

  const handleNameChange = React.useCallback(
    (newName, index) => {
      fastqPairs[index].name = newName;
      onChange([...fastqPairs]);
    },
    [fastqPairs, onChange]
  );

  const draggable = fastqPairs.some(({n}) => n === 1);

  return <>
    <ul
     ref={listRef}
     data-drag-active={!!curDragFile}
     className={classNames(
       style['preview-files'],
       className ? `${className}__preview-files` : null
     )}>
      {fastqPairs.map((props, idx) => (
        <FASTQPairItem
         {...props}
         key={idx}
         index={idx}
         draggable={draggable}
         className={className}
         curDragFile={curDragFile}
         onDragStart={handleDragStart}
         onDrag={handleDrag}
         onDragEnd={handleDragEnd}
         onMove={handleMove}
         onSplit={handleSplit}
         onNameChange={handleNameChange}
         onRemove={handleRemove} />
      ))}
    </ul>
  </>;
}
