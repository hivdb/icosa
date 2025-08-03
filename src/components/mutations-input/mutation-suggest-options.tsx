import React from 'react';
import Dropdown from 'react-dropdown';

import { expandIndel } from '../../utils/mutation';

import style from './style.module.scss';

/** Props for {@link MutationSuggestOptions} */
export interface MutationSuggestOptionsProps {
  /** Gene name for which suggestions are provided */
  gene: string;
  /** Suggested mutations represented as [position, amino acids] tuples */
  mutations: Array<[number, Iterable<string>]>;
  /** Configuration including references and display names */
  config: {
    allowPositions?: boolean;
    geneReferences: Record<string, string[]>;
    geneDisplay: Record<string, string>;
    messages: Record<string, string>;
  };
  /** Optional child content such as additional inputs */
  children?: React.ReactNode;
  /** Callback when a suggestion is chosen */
  onChange(option: { value: string; pos: number }): void;
}

/**
 * Present a list of mutation suggestions for a particular gene.
 *
 * @param props - {@link MutationSuggestOptionsProps}
 * @returns Section element containing selectable suggestions.
 */
export default function MutationSuggestOptions({
  gene,
  mutations,
  config: {
    allowPositions = false,
    geneDisplay,
    geneReferences,
    messages
  },
  children,
  onChange
}: MutationSuggestOptionsProps): JSX.Element {
  return (
    <section key={gene} className={style['gene-mutation-input']}>
      <h2 className={style.desc}>
        {messages[`pattern-analysis-suggest-options-label-${gene}`] ||
          `Enter ${geneDisplay[gene] || gene} mutations${
            allowPositions ? ' or positions' : ''
          }:`}
      </h2>
      {children}
      <ul className={style['gene-mutation-suggest-options']}>
        {mutations.map(([pos, aas]) => (
          <li key={pos}>
            <label htmlFor={`mut-${gene}-${pos}`}>{pos}</label>
            <Dropdown
              value={{ value: '', label: '---' }}
              options={Array.from(aas)
                .map(aa => ({
                  pos,
                  value: `${gene}:${geneReferences[gene][pos - 1]}${pos}${expandIndel(aa)}`,
                  label: expandIndel(aa)
                }))
                .concat([
                  {
                    pos,
                    value: `${gene}:${geneReferences[gene][pos - 1]}${pos}`,
                    label: '*'
                  }
                ])}
              placeholder="---"
              name={`mut-${gene}-${pos}`}
              onChange={onChange}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
