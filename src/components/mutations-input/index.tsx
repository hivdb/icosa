import React from 'react';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';

import { sanitizeMutations } from '../../utils/mutation';

import MutationsTagsInput from './mutations-tagsinput';
import useMutationPrefills from './mutation-prefills';
import MutationSuggestOptions from './mutation-suggest-options';
import type { MutationsConfig } from './types';
import style from './style.module.scss';

// Re-export types for external use
export type { MutationsConfig } from './types';

/** Props for {@link MutationsInput} */
export interface MutationsInputProps {
  /** Configuration controlling mutation behavior */
  config: MutationsConfig;
  /** CSS class applied to the outer container */
  className?: string;
  /** Current list of mutation strings */
  mutations: string[];
  /** Change handler invoked with new payload */
  onChange(payload: Record<string, unknown>, preventSubmit: boolean): void;
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
}: MutationsInputProps): React.JSX.Element {

  // prevent updating handleMutationSelect when mutations change, which would
  // cause the mutation suggestions to re-render
  const mutationsRef = React.useRef(mutations);
  mutationsRef.current = mutations;

  // keep a stable reference to extras to prevent unnecessary re-renders of
  // prefill options and mutation suggestions when extras change
  const stableExtras = React.useRef(extras);
  if (!isEqual(stableExtras.current, extras)) {
    stableExtras.current = extras;
  }

  const { mutationSplitGeneInput: splitGeneInput, mutationSuggestions } = config;

  const handleChange = React.useCallback(
    (payload: Record<string, any>, preventSubmit: boolean) =>
      onChange({ ...stableExtras.current, ...payload }, preventSubmit),
    [onChange]
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
      const [sanitized, allErrors] = sanitizeMutations([...mutationsRef.current, mut], config);
      handleChange({ mutations: sanitized }, allErrors.length > 0);
    },
    [config, handleChange]
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
