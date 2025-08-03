import React from 'react';
import {FaDownload} from '@react-icons/all-files/fa/FaDownload';

import {makeDownload} from '../../../utils/download';
import Button from '../../button';
import parentStyle from '../style.module.scss';

/**
 * Properties for the {@link DownloadConsensus} component.
 *
 * @param name - Sample name used as FASTA header and file name.
 * @param assembledConsensus - Consensus sequence in FASTA format.
 * @param maxMixtureRate - Mixture rate threshold used for assembly.
 * @param minPrevalence - Minimum prevalence threshold used for assembly.
 * @param minPositionReads - Minimum read depth used for assembly.
 */
export interface DownloadConsensusProps {
  name: string;
  assembledConsensus: string;
  maxMixtureRate: number;
  minPrevalence: number;
  minPositionReads: number;
}

/**
 * Render a button allowing the user to download the assembled consensus
 * sequence as a FASTA file.
 *
 * @param props - {@link DownloadConsensusProps} describing the sequence
 *   and thresholds.
 * @returns React element containing the download button.
 */
export default function DownloadConsensus({
  name,
  assembledConsensus,
  maxMixtureRate,
  minPrevalence,
  minPositionReads
}: DownloadConsensusProps) {
  const onDownload = React.useCallback(
    () => {
      const fasta = `>${
        name
      } posreads: ${
        minPositionReads
      }; cutoff: ${
        minPrevalence
      }; mixrate: ${
        maxMixtureRate
      }\n${assembledConsensus}`;
      makeDownload(`${name}.fas`, 'application/fasta', fasta);
    },
    [name, maxMixtureRate, minPrevalence, minPositionReads, assembledConsensus]
  );
  return <Button
   className={parentStyle.button}
   onClick={onDownload}>
    <FaDownload className={parentStyle['icon-before-text']} />
    Consensus sequence
  </Button>;
}
