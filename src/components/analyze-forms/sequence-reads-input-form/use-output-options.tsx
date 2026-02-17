import React from 'react';
import RadioInput from '../../radio-input';
import CheckboxInput from '../../checkbox-input';
import SeqSummary from '../../report/seq-summary';

import type {OutputOptionState} from '../types';
import style from '../style.module.scss';

export interface SeqReadsOutputOption {
  label: React.ReactNode;
  children?: React.ReactNode[];
  defaultChildren?: number[];
  renderer?: (state: OutputOptionState) => React.ReactNode;
}

export interface UseOutputOptionsProps {
  outputOptions?: Record<string, SeqReadsOutputOption>;
}

/**
 * Hook managing output option selection for sequence reads analysis forms.
 *
 * @param props - Configuration including optional output options map.
 * @returns Selected option, options map and rendered JSX element.
 */
export default function useOutputOptions({
  outputOptions: origOutputOptions
}: UseOutputOptionsProps) {
  const outputOptions = React.useMemo<Record<string, SeqReadsOutputOption>>(
    () => ({
      __default: {label: 'HTML'},
      ...(origOutputOptions || {})
    }),
    [origOutputOptions]
  );

  const [outputOption, setOutputOption] = React.useState<{name: string; children: Set<number> | null}>(
    {
      name: '__default',
      children: null
    }
  );

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const name = e.currentTarget.value;
      const target = outputOptions[name];
      const children = target.children
        ? new Set<number>(target.defaultChildren)
        : null;
      setOutputOption({name, children});
    },
    [outputOptions]
  );

  const handleChildChange = React.useCallback(

    (e: React.ChangeEvent<HTMLInputElement>) => {
      let {children} = outputOption;
      const child = parseInt(e.currentTarget.value);
      if (children) {
        if (e.currentTarget.checked) {
          children.add(child);
        } else {
          children.delete(child);
        }
        children = new Set(children);
      }
      setOutputOption({...outputOption, children});
    },
    [outputOption]
  );

  const hasOptions = Object.keys(outputOptions || {}).length > 1;
  const hasOptionChild = outputOption.children !== null;

  let jsx: React.ReactNode = null;
  if (hasOptions) {
    jsx = (
      <fieldset className={style['output-options']}>
        <legend>Output options</legend>
        <div className={style['divided-options']}>
          <SeqSummary titleWidth="16rem" headless cutoffKeyPoints={[]} includeGenes={[]}>
            <SeqSummary.MinPositionReads />
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
          </SeqSummary>
          <div className={style['seqreads-output-options']}>
            <div>
              {Object.entries(outputOptions)
                .sort()
                .map(([value, {label}]: [string, SeqReadsOutputOption], idx: number) => (
                  <RadioInput
                   key={idx}
                   id={`output-options-${idx}`}
                   name="output-options"
                   value={value}
                   onChange={handleChange}
                   checked={value === outputOption.name}>
                    {label}
                  </RadioInput>
                ))}
            </div>
            {hasOptionChild ? (
              <div className={style.children}>
                <label className={style['input-label']} htmlFor="output-options-child">
                  Select outputs:{' '}
                </label>
                {outputOptions[outputOption.name].children?.map((label: React.ReactNode, idx: number) => (
                  <CheckboxInput
                   id={`output-options-child-${idx}`}
                   name="output-option-children"
                   key={idx}
                   value={idx}
                   onChange={handleChildChange}
                   checked={outputOption.children?.has(idx) ?? false}>
                    {label}
                  </CheckboxInput>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </fieldset>
    );
  }
  return {
    outputOption,
    outputOptions,
    outputOptionElement: jsx
  };
}

