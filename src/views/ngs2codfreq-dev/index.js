import React from 'react';
import {useRouter} from 'found';

import NGS2CodFreq from '../../components/ngs2codfreq';
import ConfigContext, {
  configWrapper
} from '../../components/report/config-context';


function reformCodFreqs(allSequenceReads, geneValidator) {
  return allSequenceReads.map(
    ({allReads, ...seqReads}) => ({
      allReads: allReads.map(
        ({allCodonReads, gene, position, ...read}) => {
          [gene, position] = geneValidator(gene, position);
          return {
            allCodonReads: allCodonReads.map(
              ({codon, reads}) => ({codon, reads})
            ),
            gene,
            position,
            ...read
          };
        }
      ),
      ...seqReads
    })
  );
}


export default function NGS2CodFreqDev() {
  const {
    router,
    match: {
      location,
      location: {
        query: {task: taskKey} = {}
      } = {}
    }
  } = useRouter();
  const configContext = configWrapper({
    configFromURL: (
      'https://s3-us-west-2.amazonaws.com/cms.hivdb.org/chiro-dev2/' +
      'pages/sierra-sars2.json'
    )
  });

  const handleTriggerRunner = React.useCallback(
    newTaskKey => {
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

  const handleLoad = React.useCallback(
    codfreqs => {
      console.log(codfreqs);
      // const geneValidator = buildGeneValidator(config.geneValidatorDefs);
      // console.log(reformCodFreqs(codfreqs, geneValidator));
    },
    []
  );

  const handleAnalyze = React.useCallback(
    codfreqs => {
      console.log(codfreqs);
    },
    []
  );

  return (
    <ConfigContext.Provider value={configContext}>
      <NGS2CodFreq
       key={taskKey || 'new-uploader'}
       taskKey={taskKey}
       onLoad={handleLoad}
       onAnalyze={handleAnalyze}
       onTriggerRunner={handleTriggerRunner} />
    </ConfigContext.Provider>
  );
}
