import React from 'react';
import PropTypes from 'prop-types';
import {FaDownload} from '@react-icons/all-files/fa/FaDownload';

import {makeDownload} from '../../../utils/download';
import Button from '../../button';
import parentStyle from '../style.module.scss';


DownloadConsensus.propTypes = {
  name: PropTypes.string.isRequired,
  assembledConsensus: PropTypes.string.isRequired,
  maxMixtureRate: PropTypes.number.isRequired,
  minPrevalence: PropTypes.number.isRequired,
  minPositionReads: PropTypes.number.isRequired
};

export default function DownloadConsensus({
  name,
  assembledConsensus,
  maxMixtureRate,
  minPrevalence,
  minPositionReads
}) {
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
