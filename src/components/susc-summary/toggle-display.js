import React from 'react';
import PropTypes from 'prop-types';
import style from './style.module.scss';


ToggleDisplayButton.propTypes = {
  expanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  numRemainRows: PropTypes.number.isRequired
};

function ToggleDisplayButton({
  expanded,
  onToggle,
  numRemainRows: num
}) {
  if (num === 0) {
    return null;
  }
  return <>
    <button
     onClick={onToggle}
     className={style['toggle-display']}
     data-expanded={expanded}>
      Show {num > 1 ? num : 'one'}{' '}
      {expanded ? 'less' : 'more'} result{num > 1 ? 's' : ''}
    </button>
    <div className={style['button-placeholder']} />
  </>;
}


export default function useToggleDisplay(rows) {
  const [expanded, onToggle] = React.useReducer(expanded => !expanded, false);
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
