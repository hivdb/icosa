import React from 'react';
import PropTypes from 'prop-types';
import {
  Stage,
  StructureComponent
} from 'react-ngl';
import * as NGL from 'ngl';

import {getColorInt} from '../../utils/colors';

import {viewShape, residueAnnotShape} from './prop-types';
import ResidueLabels from './residue-labels';
import CameraController from './camera-controller';
import HoverController from './hover-controller';


ProteinViewer.propTypes = {
  views: PropTypes.arrayOf(viewShape.isRequired).isRequired,
  residues: PropTypes.arrayOf(
    residueAnnotShape.isRequired
  ).isRequired,
  verboseCameraController: PropTypes.bool
};

export default function ProteinViewer({
  views,
  residues,
  verboseCameraController
}) {
  const [view, setView] = React.useState(views[0]);
  const {name: viewName, pdb, sele, defaultCameraState} = view;
  const [cameraState, setCameraState] = React.useState();

  const handleCameraMove = React.useCallback(
    newCameraState => setCameraState({...cameraState, ...newCameraState}),
    [cameraState]
  );

  const reprList = React.useMemo(() => {
    const hlAtom = residues.reduce(
      (acc, {resno, bgColor}) => {
        acc[resno] = bgColor;
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
    const seleSuffix = sele ? `AND ${sele}` : '';
    return [{
      type: 'tube',
      params: {
        sele,
        radius: .1,
        color: 'white'
      }
    }, {
      type: 'spacefill',
      params: {
        sele: `(${Object.keys(hlAtom).join(' OR ')}) AND .CA ${seleSuffix}`,
        radius: 1.8,
        color: schemeId
      }
    }];
  }, [residues, sele]);

  return React.useMemo(
    () => <>
      <Stage
       key={`stage-${viewName}`}
       width={600}
       height={600}
       params={{
         backgroundColor: '#fff'
       }}
       cameraState={cameraState}
       onCameraMove={handleCameraMove}>
        <StructureComponent
         key={`component-${viewName}`}
         path={`rcsb://${pdb}`}
         reprList={reprList}>
          <ResidueLabels sele={sele} residues={residues} />
          <HoverController sele={sele} residues={residues} />
          <CameraController
           pdb={pdb}
           sele={sele}
           views={views}
           currentViewName={viewName}
           setView={setView}
           verbose={verboseCameraController}
           defaultCameraState={defaultCameraState}
           cameraState={cameraState}
           setCameraState={setCameraState} />
        </StructureComponent>
      </Stage>
    </>,
    [
      sele,
      viewName,
      views,
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
