import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';

import ConfigContext from '../../utils/config-context';

import Link from '../link';
import Loader from '../loader';

import {identifyPairs} from './fastq-pairs';
import PreviewFiles from './preview-files';
import style from './style.module.scss';

const SUPPORT_FORMATS = {
  'chemical/seq-na-fastq': ['.fastq'],
  'application/gzip': ['.fastq.gz']
};

NGSUploadForm.propTypes = {
  isOptionsDefault: PropTypes.bool.isRequired,
  showOptionsForm: PropTypes.bool.isRequired,
  className: PropTypes.string,
  onSubmit: PropTypes.func
};

export default function NGSUploadForm({
  isOptionsDefault,
  showOptionsForm,
  className,
  onSubmit
}) {

  const [config, isConfigPending] = ConfigContext.use();
  const [fastqPairs, setFastqPairs] = React.useState([]);

  const handleUpload = React.useCallback(
    async (fileList) => {
      const fastqFiles = [];
      const knownFiles = new Set();
      for (const {pair} of fastqPairs) {
        for (const file of pair) {
          if (file) {
            knownFiles.add(file.name);
          }
        }
      }
      const unsupportedFiles = [];
      for (const file of Array.from(fileList)) {
        const {name} = file;
        if (knownFiles.has(name)) {
          unsupportedFiles.push(name);
        }
        else if (/[^\w.()-]/.test(name)) {
          unsupportedFiles.push(name);
        }
        else if (/\.fastq(\.gz)?$/i.test(name)) {
          fastqFiles.push(file);
          knownFiles.add(name);
        }
        else {
          unsupportedFiles.push(name);
        }
      }
      if (unsupportedFiles.length > 0) {
        alert(
          'Unsupported file/duplicate file/invalid file name:\n - ' +
          unsupportedFiles.join('\n - ')
        );
      }
      setFastqPairs([
        ...fastqPairs,
        ...identifyPairs(fastqFiles)
      ]);
    },
    [fastqPairs, setFastqPairs]
  );

  const handleSubmit = React.useCallback(
    e => {
      e && e.preventDefault();
      onSubmit(fastqPairs);
    },
    [onSubmit, fastqPairs]
  );

  const handleReset = React.useCallback(
    e => {
      e && e.preventDefault();
      setFastqPairs([]);
    },
    [setFastqPairs]
  );

  if (isConfigPending) {
    return <Loader inline />;
  }

  const ngs2codfreqPath = (
    window.location.pathname.replace(/[^/]+\/?$/, 'ngs2codfreq/')
  );

  return (
    <form
     data-num-pairs={fastqPairs.length}
     className={classNames(
       style['ngs2codfreq-form'],
       className ? `${className}__form` : null
     )}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      <Dropzone
       useFsAccessApi={false}
       accept={SUPPORT_FORMATS}
       onDrop={(acceptedFiles) => handleUpload(acceptedFiles)}>
        {({getRootProps, getInputProps, isDragActive}) => <>
          <input {...getInputProps()} />
          <div
           data-drag-active={isDragActive}
           {...getRootProps({
             className: classNames(
               style['ngs-input'],
               className ? `${className}__input` : null
             )
           })}>
            <div className={classNames(
              style['placeholder'],
              className ? `${className}__placeholder` : null
            )}>
              {config.messages['ngs2codfreq-placeholder'] ||
               '<ngs2codfreq-placeholder>'}
            </div>
            <button
             type="button" className={classNames(
               style['browse-files'],
               className ? `${className}__browse-files` : null
             )}>
              Browse files
            </button>
          </div>
        </>}
      </Dropzone>
      {showOptionsForm ? null : (
        <div className={classNames(
          style['options-detail'],
          className ? `${className}__options-detail` : null
        )}>
          {isOptionsDefault ? <>
            Default filter/trimming options will be applied.
          </> : <>
            Non-default customized filter/trimming options will be applied.
          </>}
          <br />
          <Link to={ngs2codfreqPath}>
            Click here
          </Link>{' '}to view and edit all the settings.
        </div>
      )}
      <PreviewFiles
       fastqPairs={fastqPairs}
       onChange={setFastqPairs}
       className={className} />
      <div className={classNames(
        style['button-group'],
        className ? `${className}__button-group` : null
      )}>
        <label className={classNames(
          style['description'],
          className ? `${className}__description` : null
        )}>
          {pluralize(
            "file",
            fastqPairs.reduce((acc, {n}) => acc + n, 0),
            true
          )}:
        </label>
        <button
         type="submit" className={classNames(
           style['btn-primary'],
           className ? `${className}__btn-primary` : null
         )}>
          Start process
        </button>
        <button
         type="reset" className={classNames(
           style['btn-default'],
           className ? `${className}__btn-default` : null
         )}>
          Reset
        </button>
      </div>
    </form>
  );
}
