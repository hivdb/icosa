import React from 'react';

import fastq2codfreq, {restoreTask} from '../../utils/fastq2codfreq';

import NGSForm from './form';
import NGSResults from './results';


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
    return true;  // should break
  }
  return false;
}


export default function NGS2CodFreq({
  taskKey,
  onTriggerRunner,
  onLoad,
  onAnalyze,
  className
}) {

  const [, forceUpdate] = React.useReducer(n => n + 1, 0);
  const {current: progressLookup} = React.useRef({});

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
    [taskKey /* eslint-disable-line react-hooks/exhaustive-deps */]
  );

  const handleSubmit = React.useCallback(
    async fastqPairs => {
      if (fastqPairs.length > 0) {
        for await (const progress of fastq2codfreq(fastqPairs)) {
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
    [forceUpdate, onTriggerRunner, onLoad, progressLookup]
  );

  if (progressLookup['create-task']) {
    return (
      <NGSResults
       className={className}
       onAnalyze={onAnalyze}
       progressLookup={progressLookup} />
    );
  }
  else {
    return (
      <NGSForm
       className={className}
       onSubmit={handleSubmit} />
    );
  }
}
