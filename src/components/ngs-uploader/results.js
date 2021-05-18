import React from 'react';
import pluralize from 'pluralize';
import classNames from 'classnames';
import {useDownloadCodFreqs} from '../report';
// import ProgressBar from 'react-progressbar';

import style from './style.module.scss';


export default function NGSResults({progressLookup, className}) {
  const allProgress = Object.values(progressLookup);
  const finalStep = allProgress.find(({step}) => step === 'finish-task');
  const {codfreqs} = finalStep || {codfreqs: []};
  const {onDownload} = useDownloadCodFreqs(codfreqs);

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
         style={{'--percent': count / total}}>
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
    {codfreqs.length > 0 ?
      <div className={classNames(
        style['button-group'],
        className ? `${className}__button-group` : null
      )}>
        <label className={classNames(
          style['description'],
          className ? `${className}__description` : null
        )}>
          {pluralize("CodFreq file", codfreqs.length, true)}:
        </label>
        <button
         type="button"
         onClick={onDownload}
         className={classNames(
           style['btn-download'],
           className ? `${className}__btn-download` : null
         )}>
          Download
        </button>
      </div> : null}
  </div>;
}
