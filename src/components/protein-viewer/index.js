import React from 'react';
import PropTypes from 'prop-types';
import {
  Stage,
  Component
} from 'react-ngl';
import * as NGL from 'ngl';

import {getColorInt} from '../../utils/colors';

import {residueAnnotShape, cameraStateShape} from './prop-types';
import HoverController from './hover-controller';
import CameraController from './camera-controller';


ProteinViewer.propTypes = {
  pdb: PropTypes.string.isRequired,
  residues: PropTypes.arrayOf(
    residueAnnotShape.isRequired
  ).isRequired,
  defaultCameraState: cameraStateShape,
  verboseCameraController: PropTypes.bool
};

export default function ProteinViewer({
  pdb,
  residues,
  defaultCameraState,
  verboseCameraController
}) {
  const [cameraState, setCameraState] = React.useState();

  const handleCameraMove = React.useCallback(
    newCameraState => setCameraState({...cameraState, ...newCameraState}),
    [cameraState]
  );

  const reprList = React.useMemo(() => {
    const hlAtom = residues.reduce(
      (acc, {resno, color}) => {
        acc[resno] = color;
        return acc;
      },
      {}
    );
    const schemeId = NGL.ColormakerRegistry.addScheme(
      function() {
        this.atomColor = atom => {
          if (atom.resno in hlAtom) {
            return hlAtom[atom.resno];
          }
          else {
            return getColorInt(atom.chainIndex, 'pale');
          }
        };
      }
    );
    return [{
      type: 'spacefill',
      params: {color: schemeId}
    }];
  }, [residues]);

  return React.useMemo(
    () => <>
      <Stage
       width={600}
       height={600}
       params={{
         backgroundColor: '#fff'
       }}
       cameraState={cameraState}
       onCameraMove={handleCameraMove}>
        <Component path={`rcsb://${pdb}`} reprList={reprList}>
          <HoverController hoverableResidues={residues} />
          <CameraController
           verbose={verboseCameraController}
           defaultCameraState={defaultCameraState}
           cameraState={cameraState}
           setCameraState={setCameraState} />
        </Component>
      </Stage>
    </>,
    [
      verboseCameraController,
      defaultCameraState,
      cameraState,
      handleCameraMove,
      pdb,
      reprList,
      residues
    ]
  );
}
