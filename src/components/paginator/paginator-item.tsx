import React from 'react';
import style from './style.module.scss';

export interface PaginatorItemProps {
  index: number;
  name: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
  isSelected: boolean;
  isHovering?: boolean;
  setCurrentHovering: (name: string | null) => void;
}

function PaginatorItem({
  index,
  name,
  href,
  onClick,
  children,
  isSelected,
  isHovering,
  setCurrentHovering
}: PaginatorItemProps) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(
      `render PaginatorItem ${index}`,
      new Date().getTime()
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

export default React.memo(
  PaginatorItem,
  (prev, next) => (
    prev.name === next.name &&
    prev.href === next.href &&
    prev.children === next.children &&
    prev.isSelected === next.isSelected &&
    prev.isHovering === next.isHovering &&
    prev.setCurrentHovering === next.setCurrentHovering
  )
);
