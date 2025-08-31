import React from 'react';
import style from './style.module.scss';
import type { SuscSummary } from './types';

/**
 * Props for {@link ToggleDisplayButton}.
 *
 * @property expanded - Whether the results are currently expanded.
 * @property onToggle - Callback invoked to toggle the expansion state.
 * @property numRemainRows - Number of rows hidden when collapsed.
 */
export interface ToggleDisplayButtonProps {
  expanded: boolean;
  onToggle: () => void;
  numRemainRows: number;
}

/**
 * Renders a button allowing users to toggle the visibility of hidden rows.
 *
 * @param props - {@link ToggleDisplayButtonProps}
 * @returns Toggle button element or `null` if no rows remain.
 */
export function ToggleDisplayButton({
  expanded,
  onToggle,
  numRemainRows: num
}: ToggleDisplayButtonProps) {
  if (num === 0) {
    return null;
  }
  return (
    <>
      <button
        onClick={onToggle}
        className={style['toggle-display']}
        data-expanded={expanded}
      >
        Show {num > 1 ? num : 'one'} {expanded ? 'less' : 'more'} result
        {num > 1 ? 's' : ''}
      </button>
      <div className={style['button-placeholder']} />
    </>
  );
}

/**
 * Hook providing toggleable display of rows based on `displayOrder`.
 *
 * Rows with `displayOrder` equal to `0` are shown by default. The returned
 * `button` element toggles between showing all rows and only the default
 * ones.
 *
 * @param rows - Array of row objects containing a `displayOrder` property.
 * @returns Filtered rows, expansion state and a toggle button element.
 */
export default function useToggleDisplay<T extends SuscSummary>(
  rows: T[]
) {
  const [expanded, onToggle] = React.useReducer((e) => !e, false);
  const numRemainRows = rows.filter(({ displayOrder }) => displayOrder !== 0).length;
  const filteredRows = expanded
    ? rows
    : rows.filter(({ displayOrder }) => displayOrder === 0);

  return {
    rows: filteredRows,
    expanded,
    button: (
      <ToggleDisplayButton
        expanded={expanded}
        onToggle={onToggle}
        numRemainRows={numRemainRows}
      />
    ),
  };
}
