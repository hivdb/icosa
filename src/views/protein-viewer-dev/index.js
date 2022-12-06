import React from 'react';
import {Rotation} from 'react-ngl';
import ProteinViewer from '../../components/protein-viewer';

const POSITION_OFFSET = 19;

const POSITION_ANNOTS = [
  {pos: 346, desc: 'R346', bgColor: 0xff0000, color: 0xffffff},
  {pos: 371, desc: 'S371', bgColor: 0xff0000, color: 0xffffff},
  {pos: 405, desc: 'D405', bgColor: 0xff0000, color: 0xffffff},
  {pos: 417, desc: 'K417', bgColor: 0xff0000, color: 0xffffff},
  {pos: 440, desc: 'N440', bgColor: 0xff0000, color: 0xffffff},
  {pos: 446, desc: 'G446', bgColor: 0xff0000, color: 0xffffff},
  {pos: 452, desc: 'L452', bgColor: 0xff0000, color: 0xffffff},
  {pos: 484, desc: 'E484', bgColor: 0xff0000, color: 0xffffff},
  {pos: 486, desc: 'F486', bgColor: 0xff0000, color: 0xffffff},
  {pos: 490, desc: 'F490', bgColor: 0xff0000, color: 0xffffff},
  {pos: 493, desc: 'Q493', bgColor: 0xff0000, color: 0xffffff},
  {pos: 496, desc: 'G496', bgColor: 0xff0000, color: 0xffffff},
  {pos: 501, desc: 'N501', bgColor: 0xff0000, color: 0xffffff},
  {pos: 856, desc: 'N856', bgColor: 0xff0000, color: 0xffffff},
  {pos: 969, desc: 'N969', bgColor: 0xff0000, color: 0xffffff},
  {pos: 614, desc: 'D614', bgColor: 0x00ff00, color: 0x000000}
];

const PDB = '6VXX';
const VIEWS = [
  {
    name: 'RBD (306-534)',
    sele: '325-553 AND :A',
    defaultCameraState: {}
  },
  {
    name: 'All (27-1147)',
    sele: '46-1166 AND :A',
    defaultCameraState: {
      rotation: new Rotation(-0.62, 0.43, 0.34, 0.57),
      distance: -214.0
    }
  }
];

export default function ProteinViewerDev() {
  const residues = React.useMemo(
    () => POSITION_ANNOTS.map(({pos, ...annot}) => ({
      resno: pos - POSITION_OFFSET,
      ...annot
    })),
    []
  );

  return (
    <ProteinViewer
     verboseCameraController
     pdb={PDB}
     views={VIEWS}
     residues={residues} />
  );
}
