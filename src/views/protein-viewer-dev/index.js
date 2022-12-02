import React from 'react';
import ProteinViewer from '../../components/protein-viewer';

const POSITION_OFFSET = 19;

const POSITION_ANNOTS = [
  {pos: 346, desc: 'R346', color: 0xff0000},
  {pos: 371, desc: 'S371', color: 0xff0000},
  {pos: 405, desc: 'D405', color: 0xff0000},
  {pos: 417, desc: 'K417', color: 0xff0000},
  {pos: 440, desc: 'N440', color: 0xff0000},
  {pos: 446, desc: 'G446', color: 0xff0000},
  {pos: 452, desc: 'L452', color: 0xff0000},
  {pos: 484, desc: 'E484', color: 0xff0000},
  {pos: 486, desc: 'F486', color: 0xff0000},
  {pos: 490, desc: 'F490', color: 0xff0000},
  {pos: 493, desc: 'Q493', color: 0xff0000},
  {pos: 496, desc: 'G496', color: 0xff0000},
  {pos: 501, desc: 'N501', color: 0xff0000},
  {pos: 856, desc: 'N856', color: 0xff0000},
  {pos: 969, desc: 'N969', color: 0xff0000}
];

export default function ProteinViewerDev() {
  const residues = React.useMemo(
    () => POSITION_ANNOTS.map(({pos, desc, color}) => ({
      resno: pos - POSITION_OFFSET,
      desc,
      color
    })),
    []
  );

  return (
    <ProteinViewer
     pdb="6VXX"
     residues={residues} />
  );
}
