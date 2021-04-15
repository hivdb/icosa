import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


function PaginatorItem({
  index,
  name,
  href,
  onClick,
  children,
  isSelected,
  isHovering,
  setCurrentHovering
}) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(
      `render PaginatorItem ${index}`,
      (new Date()).getTime()
    );
  }

  const handleMouseEnter = React.useCallback(
    () => {
      setCurrentHovering(name);
    },
    [name, setCurrentHovering]
  );

  const handleMouseLeave = React.useCallback(
    () => {
      setCurrentHovering(null);
    },
    [setCurrentHovering]
  );

  return (
    <li
     onMouseEnter={handleMouseEnter}
     onMouseLeave={handleMouseLeave}
     className={style['paginator-item']}
     data-is-hovering={isHovering}
     data-is-selected={isSelected}>
      <a
       className={style['paginator-item_link']}
       href={href}
       onClick={onClick}>
        <span className={style['paginator-item_desc']}>
          {children}
        </span>
      </a>
    </li>
  );
  
}

PaginatorItem.propTypes = {
  index: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  href: PropTypes.string,
  children: PropTypes.node.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isHovering: PropTypes.bool,
  setCurrentHovering: PropTypes.func.isRequired
};

export default React.memo(
  PaginatorItem,
  (prev, next) => (
    prev.name === next.name &&
    prev.onClick === next.onClick &&
    prev.href === next.href &&
    prev.children === next.children &&
    prev.isSelected === next.isSelected &&
    prev.isHovering === next.isHovering &&
    prev.setCurrentHovering === next.setCurrentHovering
  )
);
