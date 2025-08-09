import React from 'react';

import fastq2codfreq, {restoreTask} from '../../utils/fastq2codfreq';

import UploadForm from './upload-form';
import OptionsForm from './options-form';
import NGSResults from './results';

import useOptions from './use-options';
import type { FastqPair } from './fastq-pairs';

interface UpdateProgressArgs {
  progress: any;
  progressLookup: Record<string, any>;
  forceUpdate: () => void;
  onTriggerRunner?: (taskKey: string) => boolean | void;
  onLoad?: (codfreqs: any) => void;
}

/**
 * Update internal progress tracking and trigger side effects.
 *
 * @param args.progress - progress payload from the worker.
 * @param args.progressLookup - lookup table of progress steps.
 * @param args.forceUpdate - function to force re-render.
 * @param args.onTriggerRunner - optional callback when runner is triggered.
 * @param args.onLoad - optional callback when results are loaded.
 * @returns whether the progress loop should terminate.
 */
function updateProgress({
  progress,
  progressLookup,
  forceUpdate,
  onTriggerRunner,
  onLoad
}: UpdateProgressArgs): boolean {
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

export interface NGS2CodFreqProps {
  showOptionsForm?: boolean;
  taskKey?: string;
  onTriggerRunner?: (taskKey: string) => boolean | void;
  onLoad?: (codfreqs: any) => void;
  onAnalyze?: (codfreqs: any) => void;
  className?: string;
  runners?: any[];
}

/** Main component orchestrating the upload and processing of FASTQ files. */
export default function NGS2CodFreq({
  showOptionsForm = false,
  taskKey,
  onTriggerRunner,
  onLoad,
  onAnalyze,
  className,
  runners
}: NGS2CodFreqProps) {

  const [, forceUpdate] = React.useReducer(n => n + 1, 0);
  const {current: progressLookup} = React.useRef<Record<string, any>>({});
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
    async (fastqPairs: FastqPair[]) => {
      if (fastqPairs.length > 0) {
        const {fastpConfig, cutadaptConfig, ivarConfig, primerType} = options;
        const requestOptions: {
          fastpConfig: typeof fastpConfig;
          cutadaptConfig?: typeof cutadaptConfig;
          ivarConfig?: typeof ivarConfig;
        } = {fastpConfig};
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
