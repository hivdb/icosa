import React from 'react';

import fastq2codfreq, {restoreTask} from '../../utils/fastq2codfreq';

import UploadForm from './upload-form';
import OptionsForm from './options-form';
import NGSResults from './results';

import useOptions from './use-options';

interface Progress {
  step: string;
  taskKey?: string;
  loaded?: boolean;
  codfreqs?: any[];
}

interface UpdateProgressArgs {
  progress: Progress;
  progressLookup: Record<string, Progress>;
  forceUpdate: () => void;
  onTriggerRunner?: (taskKey: string) => boolean | void;
  onLoad?: (codfreqs: any[]) => void;
}

/**
 * Update progress state during FASTQ to codfreq conversion.
 *
 * @param args - Collection of progress handling helpers.
 * @returns `true` if processing should stop, otherwise `false`.
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
    if (onTriggerRunner(taskKey as string) === false) {
      return true; // should break
    }
  }
  if (loaded) {
    onLoad && onLoad(codfreqs as any[]);
    return true; // should break
  }
  return false;
}

/** Props for {@link NGS2CodFreq}. */
export interface NGS2CodFreqProps {
  showOptionsForm?: boolean;
  taskKey?: string;
  onTriggerRunner?: (taskKey: string) => boolean | void;
  onLoad?: (codfreqs: any[]) => void;
  onAnalyze?: (codfreqs: any[]) => void;
  className?: string;
  runners?: any[];
}

/**
 * High level component orchestrating the FASTQ to codfreq workflow.
 *
 * @param props - {@link NGS2CodFreqProps} controlling behaviour.
 * @returns Form, options and results UI depending on progress state.
 */
export default function NGS2CodFreq({
  showOptionsForm = false,
  taskKey,
  onTriggerRunner,
  onLoad,
  onAnalyze,
  className,
  runners
}: NGS2CodFreqProps): JSX.Element {
  const [, forceUpdate] = React.useReducer(n => n + 1, 0);
  const {current: progressLookup} = React.useRef<Record<string, Progress>>({});
  const [options, setOptions, isOptionsDefault] = useOptions();

  React.useEffect(() => {
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
  }, [taskKey, forceUpdate, onTriggerRunner, onLoad, progressLookup]);

  const handleSubmit = React.useCallback(
    async (fastqPairs: any[]) => {
      if (fastqPairs.length > 0) {
        const {fastpConfig, cutadaptConfig, ivarConfig, primerType} = options;
        const requestOptions: Record<string, any> = {fastpConfig};
        if (primerType === 'fasta') {
          requestOptions.cutadaptConfig = cutadaptConfig;
        }
        else if (primerType === 'bed') {
          requestOptions.ivarConfig = ivarConfig;
        }
        for await (const progress of fastq2codfreq(
          fastqPairs,
          runners,
          requestOptions
        )) {
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
       progressLookup={progressLookup}
      />
    );
  }
  else {
    return (
      <>
        <UploadForm
         isOptionsDefault={isOptionsDefault}
         showOptionsForm={showOptionsForm}
         className={className}
         onSubmit={handleSubmit}
        />
        {showOptionsForm ? (
          <OptionsForm
           {...options}
           isDefault={isOptionsDefault}
           onChange={setOptions}
          />
        ) : null}
      </>
    );
  }
}
