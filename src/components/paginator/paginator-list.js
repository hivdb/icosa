import React from 'react';

import PaginatorItem from './paginator-item';
import style from './style.module.scss';


export default function usePaginatorList({
  currentSelected,
  childItems
}) {
  const [currentHovering, setCurrentHovering] = React.useState(null);

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
