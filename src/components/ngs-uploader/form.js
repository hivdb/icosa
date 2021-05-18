import React from 'react';
import pluralize from 'pluralize';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import {FaRegFileAlt} from '@react-icons/all-files/fa/FaRegFileAlt';
import {FaTimesCircle} from '@react-icons/all-files/fa/FaTimesCircle';

import {ConfigContext} from '../report';
import InlineLoader from '../inline-loader';

import style from './style.module.scss';

const SUPPORT_FORMATS = ".fastq, .gz";


export default function NGSForm({className, onSubmit}) {

  const [config, isConfigPending] = ConfigContext.use();
  const [fastqs, setFastqs] = React.useState([]);

  const handleUpload = React.useCallback(
    async (fileList) => {
      const fastqFiles = [...fastqs];
      const knownFiles = new Set();
      for (const {name} of fastqFiles) {
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
        else if (/\.fastq(\.gz)?$/i.test(name)) {
          fastqFiles.push(file);
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
      setFastqs(fastqFiles);
    },
    [fastqs, setFastqs]
  );

  const handleSubmit = React.useCallback(
    e => {
      e && e.preventDefault();
      onSubmit(fastqs);
    },
    [onSubmit, fastqs]
  );

  const handleReset = React.useCallback(
    e => {
      e && e.preventDefault();
      setFastqs([]);
    },
    [setFastqs]
  );

  const handleRemoveFastq = React.useCallback(
    index => {
      return (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fastqFiles = [...fastqs];
        fastqFiles.splice(index, 1);
        setFastqs(fastqFiles);
      };
    },
    [fastqs, setFastqs]
  );

  if (isConfigPending) {
    return <InlineLoader />;
  }

  return (
    <form
     data-num-files={fastqs.length}
     className={classNames(
       style['ngs-uploader-form'],
       className ? `${className}__form` : null
     )}
     onSubmit={handleSubmit}
     onReset={handleReset}>
      <Dropzone
       accept={SUPPORT_FORMATS}
       onDrop={(acceptedFiles) => handleUpload(acceptedFiles)}>
        {({getRootProps, getInputProps, isDragActive}) => <>
          <input {...getInputProps()} />
          <div
           data-drag-active={isDragActive}
           {...getRootProps({className: classNames(
             style['ngs-input'],
             className ? `${className}__input` : null
           )})}>
            <div className={classNames(
              style['placeholder'],
              className ? `${className}__placeholder` : null
            )}>
              {config.messages['ngs-uploader-placeholder'] ||
               '<ngs-uploader-placeholder>'}
            </div>
            <button type="button" className={classNames(
              style['browse-files'],
              className ? `${className}__browse-files` : null
            )}>
              Browse files
            </button>
          </div>
        </>}
      </Dropzone>
      <ul className={classNames(
        style['preview-files'],
        className ? `${className}__preview-files` : null
      )}>
        {fastqs.map((f, idx) => (
          <li key={`fastq-${idx}`}>
            <FaRegFileAlt className={classNames(
              style['file-icon'],
              className ? `${className}__file-icon` : null
            )} />
            <span className={classNames(
              style['file-name'],
              className ? `${className}__file-name` : null
            )}>{f.name}</span>
            <FaTimesCircle
             onClick={handleRemoveFastq(idx)}
             className={classNames(
               style.remove,
               className ? `${className}__file-remove` : null
             )} />
          </li>
        ))}
      </ul>
      <div className={classNames(
        style['button-group'],
        className ? `${className}__button-group` : null
      )}>
        <label className={classNames(
          style['description'],
          className ? `${className}__description` : null
        )}>
          {pluralize("file", fastqs.length, true)}:
        </label>
        <button type="submit" className={classNames(
          style['btn-submit'],
          className ? `${className}__btn-submit` : null
        )}>
          Start process
        </button>
        <button type="reset" className={classNames(
          style['btn-reset'],
          className ? `${className}__btn-reset` : null
        )}>
          Reset
        </button>
      </div>
    </form>
  );
}
