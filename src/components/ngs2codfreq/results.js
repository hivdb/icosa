import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import classNames from 'classnames';
import {downloadCodfreqs} from '../../utils/fastq2codfreq';
import InlineLoader from '../inline-loader';
// import ProgressBar from 'react-progressbar';

import style from './style.module.scss';


NGSResults.propTypes = {
  taskKey: PropTypes.string.isRequired,
  progressLookup: PropTypes.object,
  className: PropTypes.string,
  onAnalyze: PropTypes.func
};


export default function NGSResults({
  taskKey,
  progressLookup,
  className,
  onAnalyze
}) {
  const allProgress = Object.values(progressLookup);
  const finalStep = allProgress.find(({step}) => step === 'finish-task');
  const {codfreqs} = finalStep || {codfreqs: []};

  const onDownload = React.useCallback(
    e => {
      e && e.preventDefault();
      downloadCodfreqs(taskKey);
    },
    [taskKey]
  );

  const handleAnalyze = React.useCallback(
    e => {
      e && e.preventDefault();
      onAnalyze(codfreqs);
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
      </div> : <InlineLoader />}
  </div>;
}
