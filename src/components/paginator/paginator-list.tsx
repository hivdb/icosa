import React from 'react';
import PaginatorItem, { PaginatorItemProps } from './paginator-item';
import style from './style.module.scss';

export interface UsePaginatorListProps {
  currentSelected: string;
  childItems: PaginatorItemProps[];
}

export default function usePaginatorList({
  currentSelected,
  childItems
}: UsePaginatorListProps) {
  const [currentHovering, setCurrentHovering] = React.useState<string | null>(null);

  return {
    paginatorList: (
      <div className={style['paginator-scrollable-list']}>
        <ol
         className={style['paginator-list']}>
          {childItems.map((props, idx) => (
            <PaginatorItem
             key={idx}
             {...props}
             index={idx}
             isSelected={currentSelected === props.name}
             isHovering={currentHovering === props.name}
             setCurrentHovering={setCurrentHovering} />
          ))}
        </ol>
      </div>
    ),
    currentHovering
  };
}
