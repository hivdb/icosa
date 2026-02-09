import React from 'react';
import {useRouter} from 'found';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import {FaRegFileAlt} from '@react-icons/all-files/fa/FaRegFileAlt';
import {FaTimesCircle} from '@react-icons/all-files/fa/FaTimesCircle';

import {
  parseSequenceReads,
  buildGeneValidator
} from '../../../utils/sequence-reads';
import BigData from '../../../utils/big-data';
import readFile from '../../../utils/read-file';
import ConfigContext from '../../../utils/config-context';

import BaseForm from '../base';
import FileInput from '../../file-input';
import Link from '../../link/basic';
import Loader from '../../loader';

import type {
  SequenceRead,
  SequenceReadsInputFormProps,
  FormSubmitState,
  QueryParams
} from '../types';
import style from '../style.module.scss';

import useOutputOptions from './use-output-options';

export type {SequenceRead, SequenceReadsInputFormProps};

const SUPPORT_FORMATS = {
  'application/gzip': ['.codfreq.gz'],
  'text/csv': ['.csv'],
  'text/tab-separated-values': ['.tsv', '.txt'],
  'text/plain': ['.codfreq', '.codfish', '.aavf']
};

const SUPPORT_FORMATS_TEXT = Object.entries(SUPPORT_FORMATS)
  .reduce<string[]>((acc, [key, val]) => [...acc, key, ...val], [])
  .join(',');

const SUFFIX_PATTERN = /(\.codfreq|\.codfish|\.aavf)?(\.txt|csv|tsv)?$/i;

/**
 * Form accepting codon read files for analysis. Supports drag-and-drop and
 * handles optional output options similar to sequence form.
 */
export default function SequenceReadsInputForm({
  onSubmit,
  children,
  exampleCodonReads = [],
  to,
  ...rest
}: SequenceReadsInputFormProps & Record<string, unknown>): React.JSX.Element {
  const {outputOption, outputOptions, outputOptionElement} = useOutputOptions(
    rest
  );
  const {match: {location}} = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [config, isConfigPending] = ConfigContext.use();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [optionResult, setOptionResult] = React.useState<React.ReactNode>(null);
  const [allSequenceReads, setAllSeqReads] = React.useState<SequenceRead[]>([]);

  /**
   * Clear any uploaded sequence reads and reset the form state.
   */
  const handleReset = React.useCallback(() => setAllSeqReads([]), []);

  /**
   * Handle form submission by delegating to optional onSubmit and preparing
   * payloads for navigation.
   *
   * @param e - Synthetic submit event from the form.
   * @returns Tuple indicating validation state, router state and query.
   */
  const handleSubmit = React.useCallback(
    async (
      e: React.SyntheticEvent
    ): Promise<[boolean, FormSubmitState, QueryParams?]> => {
      e && e.persist();
      let validated = true;
      let state: FormSubmitState = {};
      if (onSubmit) {
        [validated, state] = await onSubmit(e, allSequenceReads);
      }
      if (validated) {
        if (outputOption.name.startsWith('__')) {
          await BigData.clear();
          state = {
            ...state,
            allSequenceReads: await BigData.save(allSequenceReads),
            outputOption: outputOption.name.replace(/^__/, '')
          };
        } else {
          validated = false;
          setSubmitting(true);
          state.allSequenceReads = allSequenceReads;
          state.children = outputOption.children;
          state.onFinish = () =>
            setTimeout(() => {
              setSubmitting(false);
              setOptionResult(null);
            });
          const renderer = outputOptions[outputOption.name]?.renderer;
          if (renderer) {
            setOptionResult(renderer(state));
          }
        }
      }
      return [validated, state, location.query];
    },
    [
      onSubmit,
      location.query,
      allSequenceReads,
      outputOption.name,
      outputOption.children,
      outputOptions
    ]
  );

  /**
   * Load example codon read files from predefined URLs into form state.
   *
   * @param e - Click event from the example data link.
   */
  const handleLoadExamples = React.useCallback(
    async (e: React.SyntheticEvent) => {
      e && e.preventDefault();
      setLoading(true);
      const geneValidator = buildGeneValidator(config!.geneValidatorDefs);
      const allSeqReads: SequenceRead[] = [];
      for (const url of exampleCodonReads) {
        const resp = await fetch(url);
        const data = await resp.text();
        const parts = url.split('/');
        const name = parts[parts.length - 1];
        allSeqReads.push(
          parseSequenceReads(name.replace(SUFFIX_PATTERN, ''), data, geneValidator)
        );
      }
      setAllSeqReads(allSeqReads);
      setLoading(false);
    },
    [config, exampleCodonReads]
  );

  /**
   * Process a list of uploaded files, parsing any supported codon read files
   * and storing the results in component state.
   *
   * @param fileList - Files selected via input element or drag-and-drop.
   */
  const handleUpload = React.useCallback(
    async (fileList: FileList | File[]) => {
      setLoading(true);
      const knownFiles = new Set<string>();
      const geneValidator = buildGeneValidator(config!.geneValidatorDefs);
      for (const {name} of allSequenceReads) {
        knownFiles.add(name);
      }
      const unsupportedFiles: string[] = [];
      for (const file of Array.from(fileList)) {
        const name = (file as File).name;
        if (knownFiles.has(name) || /[^\w.()-]/.test(name)) {
          unsupportedFiles.push(name);
        } else {
          const data = await readFile(file as File);
          allSequenceReads.push(
            parseSequenceReads(name.replace(SUFFIX_PATTERN, ''), data, geneValidator)
          );
          setAllSeqReads([...allSequenceReads]);
        }
      }
      if (unsupportedFiles.length > 0) {
        alert(
          'Unsupported file/duplicate file/invalid file name:\n - ' +
            unsupportedFiles.join('\n - ')
        );
      }
      setLoading(false);
    },
    [config, allSequenceReads]
  );

  /**
   * Remove an uploaded sequence read entry by index.
   *
   * @param index - Position of the entry to remove.
   * @returns Event handler that performs the removal.
   */
  const handleRemove = React.useCallback(
    (index: number) => {
      return (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        allSequenceReads.splice(index, 1);
        setAllSeqReads([...allSequenceReads]);
      };
    },
    [allSequenceReads]
  );

  const allowSubmit = !loading && allSequenceReads.length > 0;

  if (isConfigPending) {
    return <Loader inline />;
  }

  return (
    <BaseForm
     to={to}
     resetDisabled={!allowSubmit || isSubmitting}
     submitDisabled={!allowSubmit || isSubmitting}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      {children}
      <div className={style['input-group']}>
        <label className={style['input-label']} htmlFor="reads-file">
          Upload file(s):
        </label>
        <FileInput
         onChange={handleUpload}
         name="reads-file"
         multiple
         accept={SUPPORT_FORMATS_TEXT}
        />
        <span className={style['file-options']}>
          {exampleCodonReads && exampleCodonReads.length ? (
            <Link href="#" onClick={handleLoadExamples}>
              Load Example Data
            </Link>
          ) : null}
        </span>
      </div>
      <Dropzone
       useFsAccessApi={false}
       accept={SUPPORT_FORMATS}
       onDrop={handleUpload}>
        {({getRootProps, getInputProps, isDragActive}) => (
          <div className={style.dropzone}>
            <input {...getInputProps()} />
            <ul
             data-drag-active={isDragActive}
             data-placeholder={config!.messages['seqreads-analysis-form-placeholder']}
             {...getRootProps({className: style['sequence-reads-preview']})}>
              {allSequenceReads.map((sr, idx) => (
                <li key={`codfreq-${idx}`}>
                  <FaRegFileAlt className={style['file-icon']} />
                  <br />
                  <span className={style['file-name']}>{sr.name}</span>
                  <FaTimesCircle
                   onClick={handleRemove(idx)}
                   className={style.remove}
                  />
                </li>
              ))}
            </ul>
            <div
             className={style['loading-mask']}
             {...(loading ? {'data-loading': ''} : null)}>
              <Loader inline />
            </div>
          </div>
        )}
      </Dropzone>
      {outputOptionElement}
      <div className={classNames(style['loading-modal'], isSubmitting ? null : style.hidden)}>
        <div className={style.inner}>{optionResult}</div>
      </div>
    </BaseForm>
  );
}

