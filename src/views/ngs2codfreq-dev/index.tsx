import React from 'react';
import {useRouter} from 'found';

import NGS2CodFreq from '../../components/ngs2codfreq';
import ConfigContext, {useConfigLoader} from '../../utils/config-context';

interface CodonRead {
  codon: string;
  reads: number;
}

interface Read {
  allCodonReads: CodonRead[];
  gene: string;
  position: number;
  [key: string]: any;
}

interface SequenceReads {
  allReads: Read[];
  [key: string]: any;
}

type GeneValidator = (gene: string, position: number) => [string, number];

/**
 * Normalize codon frequency payloads by applying a gene validator.
 */
function reformCodFreqs(
  allSequenceReads: SequenceReads[],
  geneValidator: GeneValidator
) {
  return allSequenceReads.map(({allReads, ...seqReads}) => ({
    allReads: allReads.map(({allCodonReads, gene, position, ...read}) => {
      [gene, position] = geneValidator(gene, position);
      return {
        allCodonReads: allCodonReads.map(({codon, reads}) => ({codon, reads})),
        gene,
        position,
        ...read
      };
    }),
    ...seqReads
  }));
}

/**
 * Demo page for converting NGS reads to codon frequencies.
 */
export default function NGS2CodFreqDev() {
  const {
    router,
    match: {
      location,
      location: {query: {task: taskKey} = {}} = {}
    }
  } = useRouter();

  const configContext = useConfigLoader({
    configFromURL:
      'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev2/' +
      'pages/sierra-sars2.json'
  });

  const handleTriggerRunner = React.useCallback(
    (newTaskKey: string) => {
      if (taskKey !== newTaskKey) {
        router.push({
          ...location,
          query: {task: newTaskKey}
        });
        return false;
      }
    },
    [taskKey, router, location]
  );

  const handleLoad = React.useCallback((codfreqs: any) => {
    console.log(codfreqs);
    // const geneValidator = buildGeneValidator(config.geneValidatorDefs);
    // console.log(reformCodFreqs(codfreqs, geneValidator));
  }, []);

  const handleAnalyze = React.useCallback((codfreqs: any) => {
    console.log(codfreqs);
  }, []);

  return (
    <ConfigContext.Provider value={configContext}>
      <NGS2CodFreq
        key={taskKey || 'new-uploader'}
        taskKey={taskKey}
        onLoad={handleLoad}
        onAnalyze={handleAnalyze}
        onTriggerRunner={handleTriggerRunner}
      />
    </ConfigContext.Provider>
  );
}
