import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import ProgressBar from 'react-progressbar';
import {FaRegFileAlt} from '@react-icons/all-files/fa/FaRegFileAlt';
import {FaTimesCircle} from '@react-icons/all-files/fa/FaTimesCircle';

import {
  parseSequenceReads,
  buildGeneValidator
} from '../../../utils/sequence-reads';
import BigData from '../../../utils/big-data';
import readFile from '../../../utils/read-file';
import BaseForm from '../base';
import FileInput from '../../file-input';
import Link from '../../link/basic';
import {ConfigContext} from '../../report';
import InlineLoader from '../../inline-loader';

import style from '../style.module.scss';

import useOutputOptions from './use-output-options';

const SUPPORT_FORMATS =
  "text/tsv, text/plain, " +
  ".tsv, .txt, .codfreq, .codfish, .aavf";


/*function reformCodFreqs(allSequenceReads, geneValidator) {
  return allSequenceReads.map(
    ({allReads, ...seqReads}) => ({
      allReads: allReads.map(
        ({allCodonReads, gene, position, ...read}) => {
          [gene, position] = geneValidator(gene, position);
          return {
            allCodonReads: allCodonReads.map(
              ({codon, reads}) => ({codon, reads})
            ),
            gene,
            position,
            ...read
          };
        }
      ),
      ...seqReads
    })
  );
}*/


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

  const [config, isConfigPending] = ConfigContext.use();
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState({
    percent: 0,
    count: 0,
    total: 0
  });
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
        [validated, state] = await onSubmit(
          e, allSequenceReads
        );
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
          outputOptions[outputOption.name].callback(state)
            .progress(({
              percent,
              processedLength: count,
              seqLength: total
            }) => setProgress({
              percent: parseInt(percent * 100),
              count,
              total
            }))
            .done(() => setSubmitting(false));
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
      setProgress
    ]
  );

  const handleLoadExamples = React.useCallback(
    async (e) => {
      e && e.preventDefault();
      const geneValidator = buildGeneValidator(config.geneValidatorDefs);
      const allSequenceReads = [];
      for (const url of exampleCodonReads) {
        const resp = await fetch(url);
        const data = await resp.text();
        let name = url.split('/');
        name = name[name.length - 1];
        allSequenceReads.push(parseSequenceReads(
          name,
          data,
          geneValidator
        ));
      }
      setAllSeqReads(allSequenceReads);
    },
    [setAllSeqReads, config, exampleCodonReads]
  );

  const handleUpload = React.useCallback(
    async (fileList) => {
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
            name,
            data,
            geneValidator
          ));
        }
      }
      if (unsupportedFiles.length > 0) {
        alert(
          'Unsupported file/duplicate file/invalid file name:\n - ' +
          unsupportedFiles.join('\n - ')
        );
      }
      setAllSeqReads([...allSequenceReads]);
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
  const allowSubmit = allSequenceReads.length > 0;

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
        {({getRootProps, getInputProps, isDragActive}) => <>
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
        </>}
      </Dropzone>
      {outputOptionElement}
      <div className={classNames(
        style['loading-modal'], isSubmitting ?
        null : style.hidden)
      }>
        <div className={style.inner}>
          <strong>
            {('Analyzing sequence (' +
             `${process.count}/${process.total} finished) ...`)}
          </strong>
          <ProgressBar
           className={style['progress-bar']}
           completed={progress.percent} />
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
