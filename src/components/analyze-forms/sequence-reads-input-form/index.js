import React from 'react';
import PropTypes from 'prop-types';
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
import InlineLoader from '../../inline-loader';

import style from '../style.module.scss';

import useOutputOptions from './use-output-options';

const SUPPORT_FORMATS =
  "application/x-gzip, " +
  "text/csv, " +
  "text/tab-separated-values, " +
  "text/plain, " +
  ".csv, .tsv, .txt, .codfreq, .codfish, .aavf" +
  ".csv.gz, .tsv.gz, .txt.gz, .codfreq.gz, .codfish.gz, .aavf.gz";

const SUFFIX_PATTERN = (
  /(\.codfreq|\.codfish|\.aavf)?(\.txt|csv|tsv)?$/i
);


function SequenceReadsInputForm(props) {
  const {
    to,
    onSubmit,
    children,
    exampleCodonReads
  } = props;

  const {
    outputOption,
    outputOptions,
    outputOptionElement
  } = useOutputOptions(props);

  const [loading, setLoading] = React.useState(false);
  const [config, isConfigPending] = ConfigContext.use();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [optionResult, setOptionResult] = React.useState(null);
  const [allSequenceReads, setAllSeqReads] = React.useState([]);

  const handleReset = React.useCallback(
    () => setAllSeqReads([]),
    [setAllSeqReads]
  );

  const handleSubmit = React.useCallback(
    async (e) => {
      e && e.persist();
      let validated = true;
      let state = {};
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
        }
        else {
          validated = false; // stop submitting
          setSubmitting(true);
          state.allSequenceReads = allSequenceReads;
          state.children = outputOption.children;
          state.onFinish = () => setTimeout(() => {
            setSubmitting(false);
            setOptionResult(null);
          });
          setOptionResult(
            outputOptions[outputOption.name].renderer(state)
          );
        }
      }
      return [validated, state];
    },
    [
      onSubmit,
      outputOption,
      outputOptions,
      allSequenceReads,
      setSubmitting,
      setOptionResult
    ]
  );

  const handleLoadExamples = React.useCallback(
    async (e) => {
      e && e.preventDefault();
      setLoading(true);
      const geneValidator = buildGeneValidator(config.geneValidatorDefs);
      const allSequenceReads = [];
      for (const url of exampleCodonReads) {
        const resp = await fetch(url);
        const data = await resp.text();
        let name = url.split('/');
        name = name[name.length - 1];
        allSequenceReads.push(parseSequenceReads(
          name.replace(SUFFIX_PATTERN, ''),
          data,
          geneValidator
        ));
      }
      setAllSeqReads(allSequenceReads);
      setLoading(false);
    },
    [setAllSeqReads, config, exampleCodonReads]
  );

  const handleUpload = React.useCallback(
    async (fileList) => {
      setLoading(true);
      const knownFiles = new Set();
      const geneValidator = buildGeneValidator(config.geneValidatorDefs);
      for (const {name} of allSequenceReads) {
        knownFiles.add(name);
      }
      const unsupportedFiles = [];
      for (const file of Array.from(fileList)) {
        const name = file.name;
        if (knownFiles.has(name)) {
          unsupportedFiles.push(name);
        }
        else if (/[^\w.()-]/.test(name)) {
          unsupportedFiles.push(name);
        }
        else {
          const data = await readFile(file);
          allSequenceReads.push(parseSequenceReads(
            name.replace(SUFFIX_PATTERN, ''),
            data,
            geneValidator
          ));
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
    [config, setAllSeqReads, allSequenceReads]
  );

  const handleRemove = React.useCallback(
    index => {
      return (e) => {
        e.preventDefault();
        e.stopPropagation();
        allSequenceReads.splice(index, 1);
        setAllSeqReads([...allSequenceReads]);
      };
    },
    [allSequenceReads, setAllSeqReads]
  );
  const allowSubmit = (
    !loading &&
    allSequenceReads.length > 0
  );

  if (isConfigPending) {
    return <InlineLoader />;
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
        <label
         className={style['input-label']}
         htmlFor="reads-file">Upload file(s):</label>
        <FileInput
         onChange={handleUpload}
         name="reads-file"
         multiple
         accept={SUPPORT_FORMATS} />
        <span className={style['file-options']}>
          {exampleCodonReads && exampleCodonReads.length ?
            <Link
             href="#"
             onClick={handleLoadExamples}>
              Load Example Data
            </Link> : null}
        </span>
      </div>
      <Dropzone
       accept={SUPPORT_FORMATS}
       onDrop={(acceptedFiles) => handleUpload(acceptedFiles)}>
        {({getRootProps, getInputProps, isDragActive}) => (
          <div className={style.dropzone}>
            <input {...getInputProps()} />
            <ul
             data-drag-active={isDragActive}
             data-placeholder={
               config.messages['seqreads-analysis-form-placeholder']
             }
             {...getRootProps({className: style['sequence-reads-preview']})}>
              {allSequenceReads.map((sr, idx) => (
                <li key={`codfreq-${idx}`}>
                  <FaRegFileAlt className={style['file-icon']} />
                  <br />
                  <span className={style['file-name']}>{sr.name}</span>
                  <FaTimesCircle
                   onClick={handleRemove(idx)}
                   className={style.remove} />
                </li>
              ))}
            </ul>
            <div
             className={style['loading-mask']}
             {...(loading ? {'data-loading': ''} : null)}>
              <InlineLoader />
            </div>
          </div>
        )}
      </Dropzone>
      {outputOptionElement}
      <div className={classNames(style['loading-modal'], isSubmitting ?
        null : style.hidden)
      }>
        <div className={style.inner}>
          {optionResult}
        </div>
      </div>
    </BaseForm>
  );

}

SequenceReadsInputForm.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  outputOptions: PropTypes.object,
  onSubmit: PropTypes.func,
  exampleCodonReads: PropTypes.arrayOf(
    PropTypes.string.isRequired
  )
};

export default SequenceReadsInputForm;
