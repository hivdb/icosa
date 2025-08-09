import React from 'react';

import style from './style.module.scss';

/** Interface describing a prefill option entry */
export interface PrefillOption {
  /** Name displayed for the prefill */
  name: string;
  /** Mutations associated with the option */
  mutations: string[];
  /** Optional extra class name for styling */
  className?: string;
}

/** Props for the MutationPrefills component */
export interface MutationPrefillsProps {
  /** Label shown above the select input */
  labelMessage: string;
  /** Available prefill options */
  options?: PrefillOption[];
  /** Currently selected option */
  value?: PrefillOption | null;
  /** Callback when an option is selected */
  onSelect(option: PrefillOption | null): void;
}

/**
 * Render a list of pre-defined mutation sets allowing quick selection.
 *
 * @param props - {@link MutationPrefillsProps}
 * @returns Rendered JSX element for prefill selector.
 */
export function MutationPrefills({
  labelMessage,
  options = [],
  value,
  onSelect
}: MutationPrefillsProps): React.JSX.Element {
  const handleSelect = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      for (const option of Array.from(event.currentTarget.selectedOptions)) {
        const { value } = option;
        onSelect(options.find(({ name }) => name === value) || null);
        return;
      }
      onSelect(null);
    },
    [onSelect, options]
  );

  return (
    <div className={style['mutation-prefills']}>
      <label>{labelMessage}</label>
      <select
        multiple
        value={value ? [value.name] : []}
        onChange={handleSelect}
      >
        {options.map(({ name, className }) => (
          <option key={name} value={name} className={className}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Options for the {@link useMutationPrefills} hook */
export interface UseMutationPrefillsOptions {
  /** Callback invoked when a prefill option is applied */
  onChange(option: PrefillOption | { name: null; mutations: [] }, preventSubmit: boolean): void;
  /** Configuration object containing messages and optional prefills */
  config: {
    messages: Record<string, string>;
    mutationPrefills?: PrefillOption[];
  };
}

/**
 * Hook providing a `MutationPrefills` element if configuration supplies
 * prefill options.
 *
 * @param options - {@link UseMutationPrefillsOptions}
 * @returns Prefill selector element or null when disabled.
 */
export default function useMutationPrefills({
  onChange,
  config
}: UseMutationPrefillsOptions): React.JSX.Element | null {
  const { messages, mutationPrefills } = config;

  const handlePrefillSelect = React.useCallback(
    (option: PrefillOption | null) => {
      onChange({ ...(option || { name: null, mutations: [] }) }, false);
    },
    [onChange]
  );

  const options = React.useMemo(
    () => [
      { name: '(clear)', mutations: [], className: style['clear-prefill'] },
      ...(mutationPrefills || [])
    ],
    [mutationPrefills]
  );

  const [value, setValue] = React.useState<PrefillOption | null>(null);
  const onSelect = React.useCallback(
    (option: PrefillOption | null) => {
      if (option && option.name === '(clear)') {
        setValue(null);
        handlePrefillSelect(null);
      } else {
        setValue(option);
        handlePrefillSelect(option);
      }
    },
    [setValue, handlePrefillSelect]
  );

  if (!mutationPrefills) {
    return null;
  }

  return (
    <MutationPrefills
      labelMessage={
        messages['pattern-analysis-prefill-label'] ||
        '<pattern-analysis-prefill-label>'
      }
      value={value}
      onSelect={onSelect}
      options={options}
    />
  );
}
