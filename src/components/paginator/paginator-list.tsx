import React from 'react';
import PaginatorItem from './paginator-item';
import style from './style.module.scss';
import type {UsePaginatorListProps, PaginatorItemProps, PaginatorChildItem} from './types';

/**
 * Build a list of paginator items and track the currently hovered item.
 *
 * @param props - Hook properties
 * @param props.currentSelected - Name of the currently selected item
 * @param props.childItems - Child items extracted from Paginator children
 * @returns Object containing the rendered paginator list and hover state
 */
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
             {...(props as unknown as PaginatorItemProps)}
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
