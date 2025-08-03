import React from 'react';
import shortenMutationList from '../../utils/shorten-mutation-list';

import {getRowKey} from './funcs';
import type {Mutation, Variant} from './types';
import style from './style.module.scss';

/**
 * Props for {@link CellMutations}.
 *
 * @property mutations - Array of mutations to display.
 * @property variant - Optional variant information to show instead of mutations.
 */
export interface CellMutationsProps {
  mutations: Mutation[];
  variant?: Variant | null;
}

/**
 * Display a variant name or a formatted list of mutations for the cell.
 */
export default function CellMutations({
  mutations,
  variant,
}: CellMutationsProps) {
  const shortMutations = shortenMutationList(mutations);
  return (
    <div key={getRowKey({ mutations })} className={style['cell-variants']}>
      {variant ? (
        variant.name
      ) : (
        <div className={style['mutations']}>
          {shortMutations.map(({ text }, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 ? <span className={style['inline-divider']}> + </span> : null}
              <span className={style['mutation']}>{text}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
