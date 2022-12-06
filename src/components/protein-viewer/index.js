import React from 'react';
import PropTypes from 'prop-types';
import {
  Stage,
  StructureComponent
} from 'react-ngl';
import * as NGL from 'ngl';

import {getColorInt} from '../../utils/colors';

import {viewShape, positionAnnotShape} from './prop-types';
import ResidueLayer from './residue-layer';
import CameraController from './camera-controller';

export {viewShape as proteinViewShape};

ProteinViewer.propTypes = {
  width: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired
  ]).isRequired,
  height: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.number.isRequired
  ]).isRequired,
  views: PropTypes.arrayOf(viewShape.isRequired).isRequired,
  positions: PropTypes.arrayOf(
    positionAnnotShape.isRequired
  ).isRequired,
  verboseCameraController: PropTypes.bool
};

ProteinViewer.defaultPropTypes = {
  width: 600,
  height: 600
};

export default function ProteinViewer({
  width,
  height,
  views,
  positions,
  verboseCameraController
}) {
  const [view, setView] = React.useState(views[0]);
  const {
    name: viewName,
    pdb,
    sele,
    positionOffset = 0,
    defaultCameraState
  } = view;
  const [cameraState, setCameraState] = React.useState();

  const handleCameraMove = React.useCallback(
    newCameraState => setCameraState({...cameraState, ...newCameraState}),
    [cameraState]
  );

  const residues = React.useMemo(
    () => positions.map(({position, ...annot}) => ({
      resno: position + positionOffset,
      ...annot
    })),
    [positions, positionOffset]
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
    return [
      {
        type: 'tube',
        params: {
          sele,
          radius: .1,
          color: 'white'
        }
      },
      ...(residues.length ? [{
        type: 'spacefill',
        params: {
          sele: `(${Object.keys(hlAtom).join(' OR ')}) AND .CA ${seleSuffix}`,
          radius: 1.8,
          color: schemeId
        }
      }] : [])
    ];
  }, [residues, sele]);

  return React.useMemo(
    () => (
      <Stage
       key={`stage-${viewName}`}
       width={width}
       height={height}
       params={{
         backgroundColor: '#fff'
       }}
       cameraState={cameraState}
       onCameraMove={handleCameraMove}>
        <StructureComponent
         key={`component-${viewName}`}
         path={`rcsb://${pdb}`}
         reprList={reprList}>
          <ResidueLayer sele={sele} residues={residues} />
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
    ),
    [
      sele,
      viewName,
      views,
      width,
      height,
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
