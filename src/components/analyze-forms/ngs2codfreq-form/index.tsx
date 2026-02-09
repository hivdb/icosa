import React from 'react';
import {useRouter} from 'found';

import BigData from '../../../utils/big-data';
import ConfigContext from '../../../utils/config-context';

import NGS2CodFreq from '../../ngs2codfreq';
import Loader from '../../loader';
import {buildGeneValidator} from '../../../utils/sequence-reads';
import type {NGSRunner} from '../types';
import style from '../style.module.scss';

const SUFFIX_PATTERN = /(\.codfreq|\.codfish|\.aavf)?(\.txt|csv|tsv)?$/i;

interface CodonRead {
  codon: string;
  reads: number;
}

interface Read {
  allCodonReads: CodonRead[];
  gene: string | null;
  position: number | null;
  [key: string]: unknown;
}

interface RawSequenceRead {
  allReads: Read[];
  name: string;
  [key: string]: unknown;
}

/**
 * Normalize sequence read objects using provided gene validator.
 *
 * @param allSequenceReads - Parsed codon frequency objects.
 * @param geneValidator - Function mapping gene/position to normalized values.
 * @returns Reformatted sequence read data.
 */
function reformCodFreqs(
  allSequenceReads: RawSequenceRead[],
  geneValidator: (g: string, p: number) => [string | null, number | null]
) {
  return allSequenceReads.map(({allReads, name, ...seqReads}) => ({
    name: name.replace(SUFFIX_PATTERN, ''),
    allReads: allReads.map(({allCodonReads, gene, position, ...read}) => {
      let validatedGene: string | null = gene;
      let validatedPosition: number | null = position;
      if (gene !== null && position !== null) {
        [validatedGene, validatedPosition] = geneValidator(gene, position);
      }
      return {
        allCodonReads: allCodonReads.map(({codon, reads}: CodonRead) => ({codon, reads})),
        gene: validatedGene,
        position: validatedPosition,
        ...read
      };
    }),
    ...seqReads
  }));
}

export interface NGS2CodFreqFormProps {
  showOptionsForm?: boolean;
  runners?: NGSRunner[];
  redirectTo?: string;
  analyzeTo?: string;
}

/**
 * Wrapper around {@link NGS2CodFreq} providing redirection into analyze
 * workflows once codon frequency files are generated.
 */
export default function NGS2CodFreqForm({
  showOptionsForm,
  runners,
  redirectTo,
  analyzeTo
}: NGS2CodFreqFormProps): React.JSX.Element {
  const {
    router,
    match: {
      location: {query: {task: taskKey} = {}} = {}
    }
  } = useRouter();
  const [config, isConfigPending] = ConfigContext.use();

  const handleTriggerRunner = React.useCallback(
    (newTaskKey: string) => {
      if (taskKey !== newTaskKey && redirectTo) {
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
    async (codfreqs: RawSequenceRead[]) => {
      const geneValidator = buildGeneValidator(config!.geneValidatorDefs);
      const allSequenceReads = reformCodFreqs(codfreqs, geneValidator);
      await BigData.clear();
      router.push({
        pathname: analyzeTo!,
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
  } else {
    return (
      <NGS2CodFreq
       showOptionsForm={showOptionsForm}
       className={style['analyze-ngs2codfreq']}
       key={taskKey || 'new-ngs2codfreq'}
       taskKey={taskKey}
       runners={runners}
       onAnalyze={handleAnalyze}
       onTriggerRunner={handleTriggerRunner}
      />
    );
  }
}

export {reformCodFreqs};

