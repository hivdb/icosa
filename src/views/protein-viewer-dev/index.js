import React from 'react';
import ProteinViewer from '../../components/protein-viewer';

const POSITION_ANNOTS = [
  {position: 346, label: 'R346', bgColor: 0xff0000, color: 'white'},
  {position: 371, label: 'S371', bgColor: 0xff0000, color: 0xffffff},
  {position: 405, label: 'D405', bgColor: 0xff0000, color: 0xffffff},
  {position: 417, label: 'K417', bgColor: 0xff0000, color: 0xffffff},
  {position: 440, label: 'N440', bgColor: 0xff0000, color: 0xffffff},
  {position: 446, label: 'G446', bgColor: 0xff0000, color: 0xffffff},
  {position: 452, label: 'L452', bgColor: 0xff0000, color: 0xffffff},
  {position: 484, label: 'E484', bgColor: 0xff0000, color: 0xffffff},
  {position: 486, label: 'F486', bgColor: 0xff0000, color: 0xffffff},
  {position: 490, label: 'F490', bgColor: 0xff0000, color: 0xffffff},
  {position: 493, label: 'Q493', bgColor: 0xff0000, color: 0xffffff},
  {position: 496, label: 'G496', bgColor: 0xff0000, color: 0xffffff},
  {position: 501, label: 'N501', bgColor: 0xff0000, color: 0xffffff},
  {position: 856, label: 'N856', bgColor: 0xff0000, color: 0xffffff},
  {position: 969, label: 'N969', bgColor: 0xff0000, color: 0xffffff},
  {position: 614, label: 'D614', bgColor: 0x00ff00, color: 0x000000}
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
      rotation: [-0.62, 0.43, 0.34, 0.57]
    }
  }
];

export default function ProteinViewerDev() {
  return (
    <ProteinViewer
     verboseCameraController
     views={VIEWS}
     positions={POSITION_ANNOTS} />
  );
}
