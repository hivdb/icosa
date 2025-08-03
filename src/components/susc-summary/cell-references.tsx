import React from 'react';
import createGlobalState from 'use-persisted-state/src/createGlobalState';
import {FaEllipsisH} from '@react-icons/all-files/fa/FaEllipsisH';
import Link from '../link';
import ExtLink from '../link/external';
import {RefLink} from '../references';

import type {Reference} from './types';
import style from './style.module.scss';

const GLOBAL_STATE_KEY = '--susc-summary-toggle-cell-references';

/**
 * Hook managing global expansion state for reference lists.
 * The state is shared across component instances using `use-persisted-state`.
 *
 * @returns Tuple containing the current expansion state and a toggle function.
 */
function useToggleExpansion(): [boolean, () => void] {
  const globalState = React.useRef<ReturnType<typeof createGlobalState> | null>(
    null
  );
  const [expansion, setExpansion] = React.useState(false);
  React.useEffect(() => {
    globalState.current = createGlobalState(GLOBAL_STATE_KEY, setExpansion, false);
    return () => {
      globalState.current?.deregister();
    };
  }, []);
  const globalToggleExpansion = React.useCallback(() => {
    setExpansion((prev) => !prev);
    globalState.current?.emit(!expansion);
  }, [expansion]);
  return [expansion, globalToggleExpansion];
}

/**
 * Props for {@link LabelReferences}.
 *
 * @property children - Optional custom label text.
 */
export interface LabelReferencesProps {
  children?: React.ReactNode;
}

/**
 * Label for reference columns with a toggle to expand or collapse all
 * reference lists.
 */
export function LabelReferences({ children = 'References' }: LabelReferencesProps) {
  const [expansion, toggleExpansion] = useToggleExpansion();
  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      toggleExpansion();
    },
    [toggleExpansion]
  );
  return (
    <>
      {children}{' '}
      <a
        className={style['toggle-ref-expansion']}
        onClick={onClick}
        href="#toggle-ref-expansion"
      >
        ({expansion ? 'show less' : 'show more'})
      </a>
    </>
  );
}

/**
 * Props for {@link CellReferences} component.
 *
 * @property refs - List of references associated with the row.
 * @property openRefInNewWindow - Open references in a new browser tab.
 */
export interface CellReferencesProps {
  refs: Reference[];
  openRefInNewWindow?: boolean;
}

/**
 * Renders a list of references with optional expansion and external links.
 */
export default function CellReferences({
  refs,
  openRefInNewWindow = true,
}: CellReferencesProps) {
  const [expansion, toggleExpansion] = useToggleExpansion();
  return (
    <div className={style['cell-references']}>
      <ol data-expanded={expansion}>
        {refs.map(({ refName }) => (
          <li key={refName}>
            {openRefInNewWindow ? (
              <ExtLink href={`/search-drdb/?article=${refName}`}>{refName}</ExtLink>
            ) : (
              <Link to={`/search-drdb/?article=${refName}`}>{refName}</Link>
            )}
            <RefLink name={refName} />
          </li>
        ))}
      </ol>
      {refs.length > 2 && !expansion ? (
        <button className={style['toggle-expansion']} onClick={toggleExpansion}>
          <FaEllipsisH />
        </button>
      ) : null}
    </div>
  );
}
