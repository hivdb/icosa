import React from 'react';
import RadioInput from '../../radio-input';
import CheckboxInput from '../../checkbox-input';
import SeqSummary from '../../report/seq-summary';

import style from '../style.module.scss';

export default function useOutputOptions({
  outputOptions: origOutputOptions
}) {
  const outputOptions = React.useMemo(
    () => ({
      __default: {label: 'HTML'},
      ...origOutputOptions
    }),
    [origOutputOptions]
  );

  const [outputOption, setOutputOption] = React.useState({
    name: '__default',
    children: null
  });

  const handleChange = React.useCallback(
    e => {
      const name = e.currentTarget.value;
      const target = outputOptions[name];
      const children =
        target.children ? new Set(target.defaultChildren) : null;
      setOutputOption({name, children});
    },
    [outputOptions, setOutputOption]
  );

  const handleChildChange = React.useCallback(
    e => {
      let {children} = outputOption;
      const child = parseInt(e.currentTarget.value);
      if (e.currentTarget.checked) {
        children.add(child);
      }
      else {
        children.delete(child);
      }
      children = new Set(children);
      setOutputOption({...outputOption, children});
    },
    [outputOption, setOutputOption]
  );

  const hasOptions = Object.keys(outputOptions || {}).length > 1;
  const hasOptionChild = outputOption.children !== null;

  let jsx = null;
  if (hasOptions) {
    jsx = (
      <fieldset className={style['output-options']}>
        <legend>Output options</legend>
        <div className={style['divided-options']}>
          <SeqSummary titleWidth="14.5rem" headless>
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.MinCodonReads />
          </SeqSummary>
          <div className={style['seqreads-output-options']}>
            <div>
              {Object.entries(outputOptions)
                .sort()
                .map(([value, {label}], idx) => (
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
            {hasOptionChild ?
              <div className={style.children}>
                <label
                 className={style['input-label']}
                 htmlFor="output-options-child">Select outputs: </label>
                {outputOptions[outputOption.name].children
                  .map((label, idx) => (
                    <CheckboxInput
                     id={`output-options-child-${idx}`}
                     name="output-option-children"
                     key={idx} value={idx}
                     onChange={handleChildChange}
                     checked={outputOption.children.has(idx)}>
                      {label}
                    </CheckboxInput>
                  ))}
              </div> : null}
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
