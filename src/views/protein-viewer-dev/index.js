import React from 'react';
import {Rotation} from 'react-ngl';
import ProteinViewer from '../../components/protein-viewer';

const POSITION_OFFSET = 19;

const POSITION_ANNOTS = [
  // eslint-disable-next-line max-len
  {pos: 346, label: 'R346', bgColor: 0xff0000, color: 0xffffff, desc: 'blah blah'},
  {pos: 371, label: 'S371', bgColor: 0xff0000, color: 0xffffff},
  {pos: 405, label: 'D405', bgColor: 0xff0000, color: 0xffffff},
  {pos: 417, label: 'K417', bgColor: 0xff0000, color: 0xffffff},
  {pos: 440, label: 'N440', bgColor: 0xff0000, color: 0xffffff},
  {pos: 446, label: 'G446', bgColor: 0xff0000, color: 0xffffff},
  {pos: 452, label: 'L452', bgColor: 0xff0000, color: 0xffffff},
  {pos: 484, label: 'E484', bgColor: 0xff0000, color: 0xffffff},
  {pos: 486, label: 'F486', bgColor: 0xff0000, color: 0xffffff},
  {pos: 490, label: 'F490', bgColor: 0xff0000, color: 0xffffff},
  {pos: 493, label: 'Q493', bgColor: 0xff0000, color: 0xffffff},
  {pos: 496, label: 'G496', bgColor: 0xff0000, color: 0xffffff},
  {pos: 501, label: 'N501', bgColor: 0xff0000, color: 0xffffff},
  {pos: 856, label: 'N856', bgColor: 0xff0000, color: 0xffffff},
  {pos: 969, label: 'N969', bgColor: 0xff0000, color: 0xffffff},
  {pos: 614, label: 'D614', bgColor: 0x00ff00, color: 0x000000}
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
