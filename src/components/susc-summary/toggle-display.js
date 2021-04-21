import React from 'react';
import createPersistedReducer from '../../utils/use-persisted-reducer';
import style from './style.module.scss';

function ToggleDisplayButton({
  expanded,
  onToggle,
  numRemainRows: num
}) {
  if (num === 0) {
    return null;
  }
  return (
    <button
     onClick={onToggle}
     className={style['toggle-display']}
     data-expanded={expanded}>
      Show {num} {expanded ? 'less' : 'more'}
    </button>
  );
}


const useExpanded = createPersistedReducer(
  '--sierra-susc-summary-toggle-display'
);


export default function useToggleDisplay(rows) {
  const [expanded, onToggle] = useExpanded(expanded => !expanded, false);
  let filteredRows;
  const numRemainRows = rows.filter(
    ({displayOrder}) => displayOrder !== 0
  ).length;
  if (expanded) {
    filteredRows = rows;
  }
  else {
    filteredRows = rows.filter(({displayOrder}) => displayOrder === 0);
  }

  return {
    rows: filteredRows,
    expanded,
    button: <ToggleDisplayButton {...{expanded, onToggle, numRemainRows}} />
  };

}
