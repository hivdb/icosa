import React from 'react';
import classNames from 'classnames';

import style from '../style.module.scss';

/**
 * Placeholder element used while dragging FASTQ files for reordering.
 *
 * @param props - Configuration controlling drop behaviour.
 * @returns List item acting as a drop target.
 */
export default function DropPlaceholder({
  allowFiles,
  blockFiles,
  onMove,
  curDragFile,
  className
}: {
  allowFiles?: any[];
  blockFiles?: any[];
  onMove: (payload: any) => void;
  curDragFile?: any;
  className?: string;
}): JSX.Element {
  const allowDrop =
    curDragFile &&
    (allowFiles ? allowFiles.includes(curDragFile) : true) &&
    (blockFiles ? !blockFiles.includes(curDragFile) : true);

  const handleDragOver = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      if (allowDrop) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        (event.currentTarget.dataset as any).dropping = 'true';
      }
    },
    [allowDrop]
  );

  const handleDragLeave = React.useCallback((event: React.DragEvent<HTMLLIElement>) => {
    delete (event.currentTarget.dataset as any).dropping;
  }, []);

  const handleDrop = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>) => {
      event.dataTransfer.dropEffect = 'move';
      delete (event.currentTarget.dataset as any).dropping;
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
     data-await-dropping={allowDrop}
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop}
    />
  );
}
