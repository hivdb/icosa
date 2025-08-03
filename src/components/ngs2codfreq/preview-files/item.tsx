import React from 'react';
import React from 'react';
import classNames from 'classnames';
import {FaRegFileAlt} from '@react-icons/all-files/fa/FaRegFileAlt';
import {FaTimesCircle} from '@react-icons/all-files/fa/FaTimesCircle';
import {FaArrowsAlt} from '@react-icons/all-files/fa/FaArrowsAlt';
import {
  AiOutlineSplitCells
} from '@react-icons/all-files/ai/AiOutlineSplitCells';

import style from '../style.module.scss';
import DropPlaceholder from './drop-placeholder';

interface FASTQItemProps {
  file: File;
  index: number;
  className?: string;
  onDragStart: (file: File, e: React.DragEvent<HTMLLIElement>) => void;
  onDrag: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  onRemove: (args: {index: number; fileName: string}) => void;
  draggable?: boolean;
}

function FASTQItem({
  file,
  index,
  className,
  onDragStart,
  onDrag,
  onDragEnd,
  onRemove,
  draggable
}: FASTQItemProps) {
  const handleDragStart = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      event.dataTransfer.setData('text', JSON.stringify({
        fileName: file.name,
        index
      }));
      onDragStart(file, event);
      event.dataTransfer.effectAllowed = 'move';
      (event.currentTarget as HTMLElement).dataset.dragging = '';
    },
    [onDragStart, file, index]
  );

  const handleDragEnd = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      onDragEnd(event);
      delete (event.currentTarget as HTMLElement).dataset.dragging;
    },
    [onDragEnd]
  );

  const handleRemove = React.useCallback(
    () => {
      onRemove({index, fileName: file.name});
    },
    [onRemove, index, file.name]
  );

  return (
    <li
     draggable={draggable}
     onDragStart={handleDragStart}
     onDrag={onDrag}
     onDragEnd={handleDragEnd}>
      <FaRegFileAlt className={classNames(
        style['file-icon'],
        className ? `${className}__file-icon` : null
      )} />
      <span className={classNames(
        style['file-name'],
        className ? `${className}__file-name` : null
      )}>{file.name}</span>
      {draggable ? (
        <FaArrowsAlt
         alt="move to merge with another single-read sequence"
         title="move to merge with another single-read sequence"
         className={classNames(
           style.move,
           className ? `${className}__file-move` : null
         )} />
      ) : null}
      <FaTimesCircle
       alt="remove this file"
       title="remove this file"
       onClick={handleRemove}
       className={classNames(
         style.remove,
         className ? `${className}__file-remove` : null
       )} />
    </li>
  );
}


export interface FASTQPairItemProps {
  name: string;
  pair: (File | null)[];
  n: number;
  index: number;
  className?: string;
  onDragStart: (file: File, e: React.DragEvent<HTMLLIElement>) => void;
  onDrag: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  curDragFile: File | null;
  onSplit: (idx: number) => void;
  onMove: (args: {src: {index: number; fileName: string}; target: {index: number}}) => void;
  onNameChange: (name: string, index: number) => void;
  onRemove: (args: {index: number; fileName: string}) => void;
  draggable?: boolean;
}

export default function FASTQPairItem({
  name,
  pair,
  n,
  index,
  className,
  onDragStart,
  onDrag,
  onDragEnd,
  curDragFile,
  onSplit,
  onMove,
  onNameChange,
  onRemove,
  draggable
}: FASTQPairItemProps) {
  const handleSplit = React.useCallback(
    () => {
      onSplit(index);
    },
    [onSplit, index]
  );

  const handleMove = React.useCallback(
    (src: {index: number; fileName: string}) => onMove({src, target: {index}}),
    [onMove, index]
  );

  const handleNameChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newName = event.currentTarget.value;
      onNameChange(newName, index);
    },
    [onNameChange, index]
  );

  return <>
    <li
     data-n={n}
     className={classNames(
       style['fastq-pair-item'],
       className ? `${className}__fastq-pair-item` : null
     )}>
      <label htmlFor={`edit-pair-name__${name}`}>Name:</label>
      <input
       type='text'
       name={`edit-pair-name__${name}`}
       onChange={handleNameChange}
       className={classNames(
         style['edit-pair-name'],
         className ? `${className}__pair-name` : null
       )}
       value={name} />
      {n === 2 ? (
        <AiOutlineSplitCells
         alt="Split to two single-read sequences"
         title="Split to two single-read sequences"
         className={style.split}
         onClick={handleSplit} />
      ) : null}
      <ul className={classNames(
        style['fastq-pair-list'],
        className ? `${className}__fastq-pair` : null
      )}>
        {pair.map(file => file ? (
          <FASTQItem
           key={file.name}
           file={file}
           index={index}
           draggable={draggable}
           className={className}
           onDragStart={onDragStart}
           onDrag={onDrag}
           onDragEnd={onDragEnd}
           onRemove={onRemove} />
        ) : null)}
        {n === 1 ? (
          <DropPlaceholder
           blockFiles={pair}
           curDragFile={curDragFile}
           onMove={handleMove}
           className={className} />
        ) : null}
      </ul>
    </li>
  </>;

}
