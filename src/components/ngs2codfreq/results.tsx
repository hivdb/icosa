import React from 'react';
import pluralize from 'pluralize';
import classNames from 'classnames';
import {useDownload} from '../../utils/download';
import {downloadCodfreqs, saveAllFiles} from '../../utils/fastq2codfreq';
import Loader from '../loader';
// import ProgressBar from 'react-progressbar';

import type {NGSResultsProps} from './types';
import style from './style.module.scss';

/** Display progress and downloadable results of the NGS pipeline. */
/**
 * Display progress and allow downloading results produced by the NGS pipeline.
 * Provides buttons for fetching codfreq files, analyzing them in-app and
 * exporting all related files.
 *
 * @param props - Component properties
 * @param props.taskKey - Key identifying the current task
 * @param props.progressLookup - Map of step ids to progress info
 * @param props.className - Optional BEM class suffix
 * @param props.onAnalyze - Callback invoked when the analyze button is clicked
 */
export default function NGSResults({
  taskKey,
  progressLookup,
  className,
  onAnalyze
}: NGSResultsProps) {
  const allProgress = Object.values(progressLookup);
  const finalStep = allProgress.find(({step}) => step === 'finish-task');
  const {codfreqs} = finalStep || {codfreqs: []};

  const {
    onInit,
    onAddFile,
    onFinish,
    loadedFiles,
    isDownloading
  } = useDownload({
    name: 'fastq2codfreq_results',
    suffix: '',
    types: [],
    multiple: true
  });

  const onDownload = React.useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      e && e.preventDefault();
      downloadCodfreqs(taskKey || '');
    },
    [taskKey]
  );

  const onDownloadRawFiles = React.useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      e && e.preventDefault();
      if (!window.showDirectoryPicker) {
        if (!window.confirm(
          'Downloading multiple files into a directory is not yet supported ' +
          'by your browser. This program can still try to save all raw ' +
          'files (BAM/FASTQ/CodFreq/etc.) into a large ZIP file, but your ' +
          'browser may run out of memory. Please confirm or open this page ' +
          'using a recommended browser (Chrome or Edge).'
        )) {
          return;
        }
      }
      await onInit();
      saveAllFiles(taskKey || '', {onAddFile, onFinish});
    },
    [taskKey, onInit, onAddFile, onFinish]
  );

  const handleAnalyze = React.useCallback(
    (e?: React.MouseEvent<HTMLButtonElement>) => {
      e && e.preventDefault();
      if (onAnalyze && codfreqs) {
        onAnalyze(codfreqs);
      }
    },
    [onAnalyze, codfreqs]
  );

  return <div className={classNames(
    style['ngs-results-container'],
    className ? `${className}__results-container` : null
  )}>
    <ul className={classNames(
      style['ngs-results'],
      className ? `${className}__results` : null
    )}>
      {allProgress.map(({step, description, count, total}) => (
        <li
         key={step}
         data-step="step"
         style={{['--percent' as any]: count / total}}>
          <div className={classNames(
            style['result-desc'],
            className ? `${className}__result-desc` : null
          )}>
            {description}
          </div>
          {total > 1 ? <div className={classNames(
            style['result-progress'],
            className ? `${className}__result-progress` : null
          )}>
            ({count.toLocaleString('en-US')}/
            {total.toLocaleString('en-US')})
          </div> : null}
        </li>
      ))}
    </ul>
    {!isDownloading && codfreqs && codfreqs.length > 0 ?
      <div className={classNames(
        style['button-group'],
        className ? `${className}__button-group` : null
      )}>
        <label className={classNames(
          style['description'],
          className ? `${className}__description` : null
        )}>
          {pluralize("CodFreq file", codfreqs?.length ?? 0, true)}:
        </label>
        <button
         type="button"
         onClick={onDownload}
         className={classNames(
           style['btn-primary'],
           className ? `${className}__btn-primary` : null
         )}>
          Download
        </button>
        {onAnalyze ?
          <button
           type="button"
           onClick={handleAnalyze}
           className={classNames(
             style['btn-default'],
             className ? `${className}__btn-default` : null
           )}>
            Analyze
          </button> : null}
        <span className={style.or}>or</span>
        <button
         type="button"
         onClick={onDownloadRawFiles}
         className={classNames(
           style['btn-default'],
           className ? `${className}__btn-default` : null
         )}>
          Download all files (BAM/FASTQ/CodFreq/logs)
        </button>
      </div> : <>
        <Loader inline />
        {loadedFiles.length > 0 ?
          <ul>
            {loadedFiles.map(fName => (
              <li key={fName}>{fName}</li>
            ))}
          </ul> : null}
      </>}
  </div>;
}
