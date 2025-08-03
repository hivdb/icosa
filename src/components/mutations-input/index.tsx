import React from 'react';
import classNames from 'classnames';

import { sanitizeMutations } from '../../utils/mutation';

import MutationsTagsInput from './mutations-tagsinput';
import useMutationPrefills from './mutation-prefills';
import MutationSuggestOptions from './mutation-suggest-options';
import style from './style.module.scss';

/** Configuration object for {@link MutationsInput} */
export interface MutationsConfig {
  mutationSplitGeneInput?: boolean;
  mutationSuggestions?: Array<{ gene: string; mutations: Array<[number, Iterable<string>]> }>;
  geneReferences: Record<string, string[]>;
  geneDisplay: Record<string, string>;
  messages?: Record<string, string>;
  [key: string]: any;
}

/** Props for {@link MutationsInput} */
export interface MutationsInputProps {
  /** Configuration controlling mutation behavior */
  config: MutationsConfig;
  /** CSS class applied to the outer container */
  className?: string;
  /** Current list of mutation strings */
  mutations: string[];
  /** Change handler invoked with new payload */
  onChange(payload: Record<string, any>, preventSubmit: boolean): void;
  /** Whether component is currently active */
  isActive?: boolean;
  /** Additional extra fields passed back through `onChange` */
  [extra: string]: any;
}

/**
 * High level mutations input component combining text entry, prefill options
 * and suggestion dropdowns.
 *
 * @param props - {@link MutationsInputProps}
 * @returns Wrapper element containing mutation input UI.
 */
export default function MutationsInput({
  config,
  mutations = [],
  className,
  onChange,
  isActive: _isActive = true,
  ...extras
}: MutationsInputProps): JSX.Element {
  const { mutationSplitGeneInput: splitGeneInput, mutationSuggestions } = config;

  const handleChange = React.useCallback(
    (payload: Record<string, any>, preventSubmit: boolean) =>
      onChange({ ...extras, ...payload }, preventSubmit),
    [onChange, extras]
  );

  const prefillElement = useMutationPrefills({ onChange: handleChange, config });

  const handleMutationSelect = React.useCallback(
    ({ value: mut, label }: { value: string; label: string }) => {
      if (mut.length === 0) {
        return;
      } else if (label === '*') {
        const aas = prompt(`Please enter mutated amino acid(s) at position ${mut}`);
        if (aas === null) {
          return;
        }
        mut = `${mut}${aas}`;
      }
      const [sanitized, allErrors] = sanitizeMutations([...mutations, mut], config);
      handleChange({ mutations: sanitized }, allErrors.length > 0);
    },
    [config, mutations, handleChange]
  );

  return (
    <div className={classNames(style['mutation-suggest-input'], className)}>
      {splitGeneInput ? null : (
        <div className={style['mutation-main-input']}>
          {prefillElement}
          <div className={style['or']}>or</div>
          <MutationsTagsInput
            config={config}
            parentClassName={className}
            mutations={mutations}
            onChange={handleChange}
          />
        </div>
      )}
      {mutationSuggestions && mutationSuggestions.length > 0 ? (
        <div className={style['mutation-main-input-with-columns']}>
          {mutationSuggestions.map(({ gene, mutations: suggestMuts }) => (
            <MutationSuggestOptions
              key={gene}
              gene={gene}
              mutations={suggestMuts}
              config={config}
              onChange={handleMutationSelect}
            >
              {splitGeneInput ? (
                <MutationsTagsInput
                  geneOnly={gene}
                  config={config}
                  parentClassName={className}
                  mutations={mutations}
                  onChange={handleChange}
                />
              ) : null}
            </MutationSuggestOptions>
          ))}
        </div>
      ) : null}
    </div>
  );
}
