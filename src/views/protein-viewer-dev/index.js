import React from 'react';
import {Rotation} from 'react-ngl';
import ProteinViewer from '../../components/protein-viewer';

const POSITION_ANNOTS = [
  {pos: 346, label: 'R346', bgColor: 0xff0000, color: 0xffffff},
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

const VIEWS = [
  {
    pdb: '6M0J',
    name: 'RBD (306-534)',
    sele: '306-534 AND :E',
    defaultCameraState: {}
  },
  {
    pdb: '6VXX',
    name: 'All (27-1147)',
    sele: '27-1147 AND :A',
    defaultCameraState: {
      rotation: new Rotation(-0.62, 0.43, 0.34, 0.57)
    }
  }
];

export default function ProteinViewerDev() {
  const residues = React.useMemo(
    () => POSITION_ANNOTS.map(({pos, ...annot}) => ({
      resno: pos,
      ...annot
    })),
    []
  );

  return (
    <ProteinViewer
     verboseCameraController
     views={VIEWS}
     residues={residues} />
  );
}
