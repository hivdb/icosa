import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import BigData from '../../../utils/big-data';
import ConfigContext from '../../../utils/config-context';

import NGS2CodFreq from '../../ngs2codfreq';
import Loader from '../../loader';
import {buildGeneValidator} from '../../../utils/sequence-reads';
import style from '../style.module.scss';

const SUFFIX_PATTERN = (
  /(\.codfreq|\.codfish|\.aavf)?(\.txt|csv|tsv)?$/i
);


function reformCodFreqs(allSequenceReads, geneValidator) {
  return allSequenceReads.map(
    ({allReads, name, ...seqReads}) => ({
      name: name.replace(SUFFIX_PATTERN, ''),
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


NGS2CodFreqForm.propTypes = {
  showOptionsForm: PropTypes.bool,
  runners: PropTypes.array,
  redirectTo: PropTypes.string,
  analyzeTo: PropTypes.string
};

export default function NGS2CodFreqForm({
  showOptionsForm,
  runners,
  redirectTo,
  analyzeTo
}) {
  const {
    router,
    match: {
      location: {
        query: {task: taskKey} = {}
      } = {}
    }
  } = useRouter();
  const [config, isConfigPending] = ConfigContext.use();

  const handleTriggerRunner = React.useCallback(
    newTaskKey => {
      if (taskKey !== newTaskKey) {
        router.push({
          pathname: redirectTo,
          query: {task: newTaskKey}
        });
        return false;
      }
    },
    [taskKey, router, redirectTo]
  );

  const handleAnalyze = React.useCallback(
    async codfreqs => {
      const geneValidator = buildGeneValidator(config.geneValidatorDefs);
      const allSequenceReads = reformCodFreqs(codfreqs, geneValidator);
      await BigData.clear();
      router.push({
        pathname: analyzeTo,
        state: {
          allSequenceReads: await BigData.save(allSequenceReads),
          outputOption: 'default'
        }
      });
    },
    [config, analyzeTo, router]
  );

  if (isConfigPending) {
    return <Loader inline />;
  }
  else {
    return (
      <NGS2CodFreq
       showOptionsForm={showOptionsForm}
       className={style['analyze-ngs2codfreq']}
       key={taskKey || 'new-ngs2codfreq'}
       taskKey={taskKey}
       runners={runners}
       onAnalyze={handleAnalyze}
       onTriggerRunner={handleTriggerRunner} />
    );
  }
}
