import React from 'react';

import Select, { SelectOption } from '../select';
import { expandIndel } from '../../utils/mutation';
import type { MutationOptionTuple, MutationsConfig } from './types';

import style from './style.module.scss';

/** Props for {@link MutationSuggestOptions} */
export interface MutationSuggestOptionsProps {
  /** Gene name for which suggestions are provided */
  gene: string;
  /** Suggested mutations represented as [position, amino acids] tuples */
  mutations: Array<[number, Iterable<string>]>;
  /** Configuration including references and display names */
  config: Pick<MutationsConfig, 'allowPositions' | 'geneReferences' | 'geneDisplay' | 'messages'>;
  /** Optional child content such as additional inputs */
  children?: React.ReactNode;
  /** Callback when a suggestion is chosen */
  onChange(option: SelectOption): void;
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
}: MutationSuggestOptionsProps): React.JSX.Element {
  const handleChange = React.useCallback(
    (pos: number) => (newValue: SelectOption | null) => {
      if (newValue && newValue.value && newValue.label) {
        onChange({ value: newValue.value, label: newValue.label });
      }
    },
    [onChange]
  );

  const mutationOptions: MutationOptionTuple[] = React.useMemo(() => mutations.map(([pos, aas]) => [
    pos,
    aas,
    Array.from(aas).map(aa => ({
      value: `${gene}:${geneReferences[gene][pos - 1]}${pos}${expandIndel(aa)}`,
      label: expandIndel(aa)
    })).concat([
      {
        value: `${gene}:${geneReferences[gene][pos - 1]}${pos}`,
        label: '*'
      }
    ])
  ]), [gene, geneReferences, mutations]);

  const selectElements = React.useMemo(() => mutationOptions.map(([pos, , options]) => (
    <li key={pos}>
      <label htmlFor={`mut-${gene}-${pos}`}>{pos}</label>
      <Select
        inputId={`mut-${gene}-${pos}`}
        name={`mut-${gene}-${pos}`}
        classNamePrefix={style['mutation-select']}
        options={options}
        value={null}
        placeholder="---"
        onChange={handleChange(pos)}
        isClearable={false}
        isSearchable={false}
      />
    </li>
  )), [gene, mutationOptions, handleChange]);

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
        {selectElements}
      </ul>
    </section>
  );
}
