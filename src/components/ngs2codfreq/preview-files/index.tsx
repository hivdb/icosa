import React from 'react';
import classNames from 'classnames';

import {moveFile, removeFile, splicePair} from '../fastq-pairs';
import type {FastqPair} from '../types';
import style from '../style.module.scss';
import FASTQPairItem from './item';
import useUndoHistory from './undo-history';
import type {PreviewFilesProps} from './types';


function calcStep(distance: number) {
  let direction = 1;
  if (distance < 0) {
    direction = -1;
    distance = -distance;
  }
  return direction * Math.ceil(distance / 20);
}

/**
 * Display a list of FASTQ file pairs that can be reordered, renamed or split.
 * Drag-and-drop is supported for rearranging single-read files.
 *
 * @param props - Component properties
 * @param props.fastqPairs - Current FASTQ pairs to display
 * @param props.onChange - Callback invoked when the pairs change
 * @param props.className - Optional BEM class suffix for styling
 */
export default function PreviewFiles({fastqPairs, onChange, className}: PreviewFilesProps) {

  const listRef = React.useRef<HTMLUListElement>(null);
  const [curDragFile, setCurDragFile] = React.useState<File | null>(null);
  const {pushHistory} = useUndoHistory(onChange);

  React.useEffect(
    () => pushHistory(fastqPairs),
    [pushHistory, fastqPairs]
  );

  const scroll = React.useCallback(
    (step: number) => {
      if (listRef.current) {
        listRef.current.scrollTop += step;
      }
    },
    [listRef]
  );

  const handleDragStart = React.useCallback(
    (file: File) => {
      setCurDragFile(file);
    },
    [setCurDragFile]
  );

  const handleDrag = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      const {top, bottom} = listRef.current!.getBoundingClientRect();
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
    () => {
      setCurDragFile(null);
    },
    [setCurDragFile]
  );

  const handleSplit = React.useCallback(
    (idx: number) => {
      const newFastqPairs = splicePair(fastqPairs, idx);
      onChange(newFastqPairs);
    },
    [fastqPairs, onChange]
  );

  const handleMove = React.useCallback(
    ({src, target}: {src: {index: number; fileName: string}; target: {index: number}}) => {
      const newFastqPairs = moveFile(fastqPairs, src, target);
      onChange(newFastqPairs);
      setCurDragFile(null);
    },
    [fastqPairs, onChange]
  );

  const handleRemove = React.useCallback(
    ({index, fileName}: {index: number; fileName: string}) => {
      const newFastqPairs = removeFile(fastqPairs, index, fileName);
      onChange(newFastqPairs);
    },
    [fastqPairs, onChange]
  );

  const handleNameChange = React.useCallback(
    (newName: string, index: number) => {
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
