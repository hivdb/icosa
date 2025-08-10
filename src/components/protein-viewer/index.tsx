import React from 'react';
import {Stage, StructureComponent} from 'react-ngl';
import * as NGL from 'ngl';

import {getColorInt} from '../../utils/colors';

import type {View, PositionAnnot, ResidueAnnot, CameraState} from './types';
import type { RepresentationDescriptor } from 'react-ngl';
import {viewShape} from './prop-types';
import ResidueLayer from './residue-layer';
import CameraController from './camera-controller';

export type {View as ProteinView};
export {viewShape as proteinViewShape};

/** Props for {@link ProteinViewer} */
interface ProteinViewerProps {
  /** Canvas width */
  width?: string | number;
  /** Canvas height */
  height?: string | number;
  /** Available views */
  views: View[];
  /** Position annotations */
  positions: PositionAnnot[];
  /** Background color of NGL stage */
  backgroundColor?: string;
  /** Verbose camera controller */
  verboseCameraController?: boolean;
}

/** Default properties for ProteinViewer */
const defaultProps = {
  width: 600,
  height: 600,
  backgroundColor: '#fff'
};

/**
 * Wrapper component rendering an interactive protein viewer using NGL.
 *
 * @param props - {@link ProteinViewerProps}
 * @returns JSX element containing the stage and control widgets.
 */
const StageAny = Stage as unknown as React.ComponentType<any>;
const StructureComponentAny = StructureComponent as unknown as React.ComponentType<any>;

export default function ProteinViewer({
  width = defaultProps.width,
  height = defaultProps.height,
  views,
  positions,
  backgroundColor = defaultProps.backgroundColor,
  verboseCameraController
}: ProteinViewerProps) {
  const [view, setView] = React.useState<View>(views[0]);
  const {
    name: viewName,
    pdb,
    sele,
    positionOffset = 0,
    defaultCameraState
  } = view;
  const [cameraState, setCameraState] = React.useState<CameraState>();

  const handleCameraMove = React.useCallback(
    (newCameraState: CameraState) => setCameraState({...cameraState, ...newCameraState}),
    [cameraState]
  );

  const residues = React.useMemo<ResidueAnnot[]>(
    () => positions.map(({position, ...annot}) => ({
      resno: position + positionOffset,
      ...annot
    })),
    [positions, positionOffset]
  );

  const reprList = React.useMemo<RepresentationDescriptor[]>(() => {
      const hlAtom = residues.reduce<Record<number, string | number>>(
        (acc, {resno, bgColor}) => {
          acc[resno] = bgColor;
          return acc;
        },
        {}
      );
    const schemeId = NGL.ColormakerRegistry.addScheme(
      function(this: any) {
        this.atomColor = (atom: any) => {
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
      const list: RepresentationDescriptor[] = [
        {
          type: 'tube',
          params: {
            sele: sele ?? '',
            radius: 0.1,
            color: 'white'
          }
        }
      ];
      if (residues.length) {
        list.push({
          type: 'spacefill',
          params: {
            sele: `(${Object.keys(hlAtom).join(' OR ')}) AND .CA ${seleSuffix}`,
            radius: 1.8,
            color: schemeId as unknown as string
          }
        });
      }
      return list;
    }, [residues, sele]);

  return React.useMemo(
    () => (
        <StageAny
         key={`stage-${viewName}`}
         width={`${width}`}
         height={`${height}`}
         params={{backgroundColor}}
         cameraState={cameraState}
         onCameraMove={handleCameraMove}>
        <StructureComponentAny
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
        </StructureComponentAny>
      </StageAny>
    ),
    [
      sele,
      viewName,
      views,
      width,
      height,
      backgroundColor,
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

