import React from 'react';
import PropTypes from 'prop-types';

import fastq2codfreq, {restoreTask} from '../../utils/fastq2codfreq';

import UploadForm from './upload-form';
import OptionsForm from './options-form';
import NGSResults from './results';

import useOptions from './use-options';

function updateProgress({
  progress,
  progressLookup,
  forceUpdate,
  onTriggerRunner,
  onLoad
}) {
  const {step, taskKey, loaded, codfreqs} = progress;
  progressLookup[step] = progress;
  forceUpdate();
  if (step === 'trigger-runner' && onTriggerRunner) {
    if (onTriggerRunner(taskKey) === false) {
      return true; // should break
    }
  }
  if (loaded) {
    onLoad && onLoad(codfreqs);
    return true; // should break
  }
  return false;
}

NGS2CodFreq.propTypes = {
  showOptionsForm: PropTypes.bool.isRequired,
  taskKey: PropTypes.string,
  onTriggerRunner: PropTypes.func,
  onLoad: PropTypes.func,
  onAnalyze: PropTypes.func,
  className: PropTypes.string,
  runners: PropTypes.array
};

NGS2CodFreq.defaultProps = {
  showOptionsForm: false
};

export default function NGS2CodFreq({
  showOptionsForm,
  taskKey,
  onTriggerRunner,
  onLoad,
  onAnalyze,
  className,
  runners
}) {

  const [, forceUpdate] = React.useReducer(n => n + 1, 0);
  const {current: progressLookup} = React.useRef({});
  const [options, setOptions, isOptionsDefault] = useOptions();

  React.useEffect(
    () => {
      let mounted = true;
      if (mounted && taskKey) {
        (async () => {
          for await (const progress of restoreTask(taskKey)) {
            const shouldBreak = updateProgress({
              progress,
              progressLookup,
              forceUpdate,
              onTriggerRunner,
              onLoad
            });
            if (shouldBreak) {
              break;
            }
          }
        })();
      }
      return () => {
        mounted = false;
      };
    },
    [taskKey/* eslint-disable-line react-hooks/exhaustive-deps */]
  );

  const handleSubmit = React.useCallback(
    async fastqPairs => {
      if (fastqPairs.length > 0) {
        const {fastpConfig, cutadaptConfig, ivarConfig, primerType} = options;
        const requestOptions = {fastpConfig};
        if (primerType === 'fasta') {
          requestOptions.cutadaptConfig = cutadaptConfig;
        }
        else if (primerType === 'bed') {
          requestOptions.ivarConfig = ivarConfig;
        }
        for await (
          const progress of fastq2codfreq(
            fastqPairs,
            runners,
            requestOptions
          )
        ) {
          const shouldBreak = updateProgress({
            progress,
            progressLookup,
            forceUpdate,
            onTriggerRunner,
            onLoad
          });
          if (shouldBreak) {
            break;
          }
        }
      }
    },
    [options, forceUpdate, onTriggerRunner, onLoad, progressLookup, runners]
  );

  if (progressLookup['create-task']) {
    return (
      <NGSResults
       taskKey={taskKey}
       className={className}
       onAnalyze={onAnalyze}
       progressLookup={progressLookup} />
    );
  }
  else {
    return <>
      <UploadForm
       isOptionsDefault={isOptionsDefault}
       showOptionsForm={showOptionsForm}
       className={className}
       onSubmit={handleSubmit} />
      {showOptionsForm ?
        <OptionsForm
         {...options}
         isDefault={isOptionsDefault}
         onChange={setOptions} /> : null}
    </>;
  }
}
