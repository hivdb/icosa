import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from '../style.module.scss';


DropPlaceholder.propTypes = {
  allowFiles: PropTypes.array,
  blockFiles: PropTypes.array,
  onMove: PropTypes.func,
  curDragFile: PropTypes.object,
  className: PropTypes.string
};

export default function DropPlaceholder({
  allowFiles,
  blockFiles,
  onMove,
  curDragFile,
  className
}) {
  // console.log(curDragFile);
  const allowDrop = (
    curDragFile &&
    (allowFiles ? allowFiles.includes(curDragFile) : true) &&
    (blockFiles ? !blockFiles.includes(curDragFile) : true)
  );
  const handleDragOver = React.useCallback(
    event => {
      if (allowDrop) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.dataset.dropping = true;
      }
    },
    [allowDrop]
  );

  const handleDragLeave = React.useCallback(
    event => {
      event.currentTarget.dataset.dropping = false;
    },
    []
  );

  const handleDrop = React.useCallback(
    event => {
      event.dataTransfer.dropEffect = 'move';
      event.currentTarget.dataset.dropping = false;
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
     onDrop={handleDrop} />
  );
}
