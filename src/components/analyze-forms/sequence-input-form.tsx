import React from 'react';
import classNames from 'classnames';

import {parseFasta} from '../../utils/fasta';
import BigData from '../../utils/big-data';
import readFile from '../../utils/read-file';
import BaseForm from './base';
import FileInput from '../file-input';
import RadioInput from '../radio-input';
import CheckboxInput from '../checkbox-input';
import Link from '../link/basic';

import style from './style.module.scss';

export interface ExampleFasta {
  url: string;
  title: string;
}

export interface OutputOptionConfig {
  label: React.ReactNode;
  subOptions?: React.ReactNode[];
  defaultSubOptions?: number[];
  renderer?: (state: any) => React.ReactNode;
}

export interface SequenceInputFormProps {
  children?: React.ReactNode;
  childrenPlacement?: 'top' | 'bottom';
  exampleFasta?: ExampleFasta[];
  to?: string;
  outputOptions: Record<string, OutputOptionConfig>;
  onSubmit?(e: React.SyntheticEvent, sequences: any[]): Promise<any>;
}

/**
 * Form for submitting FASTA sequences for analysis. Supports uploading files,
 * entering raw text and selecting output options.
 */
export default function SequenceInputForm({
  children,
  childrenPlacement = 'top',
  exampleFasta = [],
  to,
  outputOptions,
  onSubmit
  }: SequenceInputFormProps): React.JSX.Element {
  const [header, setHeader] = React.useState('');
  const [sequence, setSequence] = React.useState('');
  const [showExamples, setShowExamples] = React.useState(false);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [outputOption, setOutputOption] = React.useState('__default');
  const [outputSubOptions, setOutputSubOptions] = React.useState<Set<number> | null>(null);
  const [optionResult, setOptionResult] = React.useState<React.ReactNode>(null);

  const allOutputOptions = React.useMemo<Record<string, OutputOptionConfig>>(
    () => ({__default: {label: 'HTML'}, ...outputOptions}),
    [outputOptions]
  );

  const handleOOChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const target = allOutputOptions[value];
        const children = target.subOptions ? new Set<number>(target.defaultSubOptions) : null;
        setOutputOption(value);
        setOutputSubOptions(children);
      },
      [allOutputOptions]
    );

  const handleOOChildChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!outputSubOptions) return;
      const child = parseInt(e.currentTarget.value, 10);
      const newSet = new Set(outputSubOptions);
      if (e.currentTarget.checked) {
        newSet.add(child);
      } else {
        newSet.delete(child);
      }
      setOutputSubOptions(newSet);
    },
    [outputSubOptions]
  );

  const handleUpload = React.useCallback((files: File[]) => {
    const file = files[0];
    if (!file || !(/^text\/.+$|^application\/x-gzip$|^$/.test(file.type))) {
      return;
    }
    readFile(file).then(seq => setSequence(seq));
  }, []);

  const handleShowExamples = React.useCallback(
    async (e: React.SyntheticEvent) => {
      e && e.preventDefault();
      if (exampleFasta.length === 1) {
        await loadExample(exampleFasta[0].url);
      } else {
        setShowExamples(true);
      }
    },
    [exampleFasta]
  );

  const loadExample = React.useCallback(async (url: string) => {
    const resp = await fetch(url);
    const seq = await resp.text();
    setSequence(seq);
    setShowExamples(false);
  }, []);

  const handleLoadExample = React.useCallback(
    async (e: React.SyntheticEvent) => {
      e && e.preventDefault();
      const url = (e.currentTarget as HTMLElement).dataset.href as string;
      await loadExample(url);
    },
    [loadExample]
  );

  const handleSubmit = React.useCallback(
    async (
      e: React.SyntheticEvent
    ): Promise<[
      boolean,
      Record<string, any>,
      Record<string, any>?
    ]> => {
      const sequences = parseFasta(sequence, 'userinput');
      if (header && sequences.length > 0) {
        sequences[0].header = header;
      }
      let validated = true;
      let state: Record<string, any> = {};
      let query: Record<string, any> | undefined;
      if (onSubmit) {
        [validated, state, query] = await onSubmit(e, sequences);
      }
      if (validated) {
        if (outputOption.startsWith('__')) {
          await BigData.clear();
          Object.assign(state, {
            sequences: await BigData.save(sequences),
            outputOption: outputOption.replace(/^__/, '')
          });
        } else {
          validated = false; // stop submitting
          setSubmitting(true);
            state.sequences = sequences.map(({header, sequence}) => ({header, sequence}));
            state.subOptionIndices = Array.from(outputSubOptions || []);
            state.onFinish = () =>
              setTimeout(() => {
                setSubmitting(false);
                setOptionResult(null);
              });
            setOptionResult(allOutputOptions[outputOption].renderer?.(state) || null);
          }
        }
        return [validated, state, query];
      },
      [
        header,
        sequence,
        onSubmit,
        outputOption,
        outputSubOptions,
        allOutputOptions
      ]
    );

  const handleReset = React.useCallback(() => {
    setHeader('');
    setSequence('');
    setShowExamples(false);
  }, []);

  const allowSubmit = sequence !== '' && !isSubmitting;

  const hasOptions = Object.keys(allOutputOptions || {}).length > 1;
  const hasOptionChild = outputSubOptions !== null;

  return (
    <BaseForm
     to={to as string}
     resetDisabled={(!sequence && !header && !showExamples) || isSubmitting}
     submitDisabled={!allowSubmit}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      {childrenPlacement === 'top' ? children : null}
      <div className={style['input-group']}>
        <label className={style['input-label']} htmlFor="header">
          Header:
        </label>
        <input
         onChange={e => setHeader(e.target.value)}
         value={header}
         className={style['header-input']}
         type="text"
         name="header"
        />
        <span className={style['header-input-notation']}> (optional) </span>
      </div>
      <div className={style['input-group']}>
        <label className={style['input-label']} htmlFor="fasta-file">
          Upload text file:
        </label>
        <FileInput
         onChange={handleUpload}
         name="fasta-file"
         accept={
           'application/x-gzip,text/plain,text/x-fasta,' +
           '.gz,.fasta,.fas,.fna'
         }
        />
        <span className={style['file-options']}>
          {!showExamples && exampleFasta && exampleFasta.length > 0 ? (
            <Link href="#" onClick={handleShowExamples}>
              Load Examples
            </Link>
          ) : null}
        </span>
      </div>
      {showExamples ? (
        <div className={style['input-group']}>
          <label className={style['input-label']}>Select an example:</label>
          <ul className={style['file-options']}>
            {exampleFasta.map(({url, title}, idx) => (
              <li key={idx}>
                <Link href={url} data-href={url} onClick={handleLoadExample}>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <textarea
       rows={7}
       className={classNames(style['input-group'], style['sequence-input'])}
       value={sequence}
       onChange={e => setSequence(e.target.value)}
      />
      {hasOptions ? (
        <fieldset className={style['output-options']}>
          <legend>Output options</legend>
          <div>
              {Object.entries(allOutputOptions)
                .sort()
                .map(([value, {label}]: [string, OutputOptionConfig], idx: number) => (
                  <RadioInput
                   key={idx}
                   id={`output-options-${idx}`}
                   name="output-options"
                   value={value}
                   onChange={handleOOChange}
                   checked={value === outputOption}>
                    {label}
                  </RadioInput>
                ))}
          </div>
          {hasOptionChild ? (
            <div className={style.children}>
              <label className={style['input-label']} htmlFor="output-options-child">
                Select outputs:{' '}
              </label>
                {allOutputOptions[outputOption].subOptions?.map(
                  (label: React.ReactNode, idx: number) => (
                    <CheckboxInput
                     id={`output-options-child-${idx}`}
                     name="output-option-children"
                     key={idx}
                     value={idx}
                     onChange={handleOOChildChange}
                     checked={outputSubOptions?.has(idx) ?? false}>
                      {label}
                    </CheckboxInput>
                  )
                )}
            </div>
          ) : null}
        </fieldset>
      ) : null}
      {childrenPlacement === 'bottom' ? children : null}
      <div className={classNames(style['loading-modal'], isSubmitting ? null : style.hidden)}>
        <div className={style.inner}>{optionResult}</div>
      </div>
    </BaseForm>
  );
}

