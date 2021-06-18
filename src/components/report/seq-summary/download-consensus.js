import React from 'react';
import PropTypes from 'prop-types';
import {FaDownload} from '@react-icons/all-files/fa/FaDownload';

import {makeDownload} from '../../../utils/download';
import Button from '../../button';
import parentStyle from '../style.module.scss';


function DownloadConsensus({
  name,
  assembledConsensus,
  maxMixturePcnt,
  minPrevalence,
  minCodonReads
}) {
  const onDownload = React.useCallback(
    () => {
      const fasta = `>${
        name
      } cdreads: ${
        minCodonReads
      }; cutoff: ${
        minPrevalence
      }; mixpcnt: ${
        maxMixturePcnt
      }\n${assembledConsensus}`;
      makeDownload(`${name}.fas`, 'application/fasta', fasta);
    },
    [name, maxMixturePcnt, minPrevalence, minCodonReads, assembledConsensus]
  );
  return <Button
   className={parentStyle.button}
   onClick={onDownload}>
    <FaDownload className={parentStyle['icon-before-text']} />
    Consensus sequence
  </Button>;
}


DownloadConsensus.propTypes = {
  name: PropTypes.string.isRequired,
  assembledConsensus: PropTypes.string.isRequired
};

export default DownloadConsensus;
