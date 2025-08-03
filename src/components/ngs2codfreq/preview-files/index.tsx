import React from 'react';
import classNames from 'classnames';

import {moveFile, removeFile, splicePair} from '../fastq-pairs';
import style from '../style.module.scss';
import FASTQPairItem from './item';
import useUndoHistory from './undo-history';

interface PreviewFilesProps {
  fastqPairs: any[];
  onChange: (pairs: any[]) => void;
  className?: string;
}

function calcStep(distance: number): number {
  let direction = 1;
  if (distance < 0) {
    direction = -1;
    distance = -distance;
  }
  return direction * Math.ceil(distance / 20);
}

/**
 * Display FASTQ file pairs and allow drag-and-drop reordering.
 */
export default function PreviewFiles({
  fastqPairs,
  onChange,
  className
}: PreviewFilesProps): JSX.Element {
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const [curDragFile, setCurDragFile] = React.useState<any>(null);
  const {pushHistory} = useUndoHistory(onChange);

  React.useEffect(() => pushHistory(fastqPairs), [pushHistory, fastqPairs]);

  const scroll = React.useCallback(
    (step: number) => {
      if (listRef.current) {
        listRef.current.scrollTop += step;
      }
    },
    [listRef]
  );

  const handleDragStart = React.useCallback((file: any) => setCurDragFile(file), []);

  const handleDrag = React.useCallback(
    (event: React.DragEvent) => {
      if (!listRef.current) return;
      const {top, bottom} = listRef.current.getBoundingClientRect();
      const listHeight = bottom - top;
      const offsetY = event.clientY - top;
      if (offsetY < 0) {
        scroll(calcStep(offsetY));
      } else if (offsetY > listHeight) {
        scroll(calcStep(offsetY - listHeight));
      }
    },
    [scroll]
  );

  const handleDragEnd = React.useCallback(() => setCurDragFile(null), []);

  const handleSplit = React.useCallback(
    (idx: number) => {
      const newFastqPairs = splicePair(fastqPairs, idx);
      onChange(newFastqPairs);
    },
    [fastqPairs, onChange]
  );

  const handleMove = React.useCallback(
    ({src, target}: {src: any; target: any}) => {
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

  return (
    <>
      <ul
       ref={listRef}
       data-drag-active={!!curDragFile}
       className={classNames(
         style['preview-files'],
         className ? `${className}__preview-files` : null
       )}
      >
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
           onRemove={handleRemove}
          />
        ))}
      </ul>
    </>
  );
}
