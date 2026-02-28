import React from 'react';
import classNames from 'classnames';

import style from '../style.module.scss';
import type {DropPlaceholderProps} from './types';

/**
 * Placeholder element displayed within file lists to indicate a valid drop
 * target. It reacts to drag events only when the dragged file is allowed to be
 * dropped on this location.
 *
 * @param props - Component props
 * @param props.allowFiles - Files that can be dropped
 * @param props.blockFiles - Files that are currently blocked from dropping
 * @param props.onMove - Callback when a file is dropped
 * @param props.curDragFile - File currently being dragged
 * @param props.className - Optional BEM class name suffix
 */
export default function DropPlaceholder({
  allowFiles,
  blockFiles,
  onMove,
  curDragFile,
  className
}: DropPlaceholderProps) {
  // console.log(curDragFile);
  const allowDrop = (
    curDragFile &&
    (allowFiles ? allowFiles.includes(curDragFile) : true) &&
    (blockFiles ? !blockFiles.includes(curDragFile) : true)
  );
  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
        if (allowDrop) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          event.currentTarget.dataset.dropping = 'true';
        }
    },
    [allowDrop]
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      event.currentTarget.dataset.dropping = 'false';
    },
    []
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      event.dataTransfer.dropEffect = 'move';
      event.currentTarget.dataset.dropping = 'false';
      const payload = JSON.parse(event.dataTransfer.getData('text'));
      onMove(payload);
    },
    [onMove]
  );
  return (
    <li
     className={classNames(
       style['drop-placeholder'],
       className ? `${className}__drop-placeholder` : null
     )}
     data-await-dropping={allowDrop ? 'true' : 'false'}
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop} />
  );
}
