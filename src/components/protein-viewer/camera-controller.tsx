import React, {useCallback, useEffect, useMemo} from 'react';
import {useStage, useComponent, Position, Rotation} from 'react-ngl';

import Select from '../select';
import Button from '../button';
import {makeDownload} from '../../utils/download';
import useMounted from '../../utils/use-mounted';

import type {CameraState, View} from './types';
import style from './style.module.scss';

/** Props for {@link CameraController} */
interface CameraControllerProps {
  /** PDB identifier */
  pdb: string;
  /** Selection string limiting the view */
  sele?: string;
  /** Whether to display camera control sliders */
  verbose?: boolean;
  /** Current view name */
  currentViewName: string;
  /** Available structural views */
  views: View[];
  /** Callback to select a different view */
  setView: (view: View) => void;
  /** Current camera state */
  cameraState?: CameraState;
  /** Default camera state for reset */
  defaultCameraState?: CameraState;
  /** Update callback for camera state */
  setCameraState: (state: CameraState) => void;
}

/**
 * Controller rendering camera options and interactive sliders to manipulate
 * NGL viewer state.
 *
 * @param props - {@link CameraControllerProps}
 * @returns Control panel React component.
 */
export default function CameraController({
  pdb,
  sele,
  verbose,
  currentViewName,
  views,
  setView,
  cameraState,
  defaultCameraState,
  setCameraState
}: CameraControllerProps) {
  const stage = useStage();
  const component = useComponent();
  const mounted = useMounted();
  const initPosition = useMemo(
    () => {
      const defaultPosition = defaultCameraState?.position;
      if (Array.isArray(defaultPosition)) {
        return new Position(...defaultPosition as number[]);
      }
      else if (defaultPosition) {
        return defaultPosition as Position;
      }
      return component.getCenter(sele).multiplyScalar(-1);
    },
    [defaultCameraState?.position, component, sele]
  );
  const initRotation = useMemo(
    () => {
      const defaultRotation = defaultCameraState?.rotation;
      if (Array.isArray(defaultRotation)) {
        return new Rotation(...defaultRotation as number[]);
      }
      else if (defaultRotation) {
        return defaultRotation as Rotation;
      }
      return new Rotation(0, 0, 0, 1);
    },
    [defaultCameraState?.rotation]
  );
  const initDistance = useMemo(
    () => defaultCameraState?.distance || component.getZoom(sele),
    [defaultCameraState?.distance, component, sele]
  );
  const positionBox = useMemo(
    () => {
      const {min, max} = component.getBox(sele);
      return {
        min: max.multiplyScalar(-1),
        max: min.multiplyScalar(-1)
      };
    },
    [component, sele]
  );

  const handleReset = useCallback(
    () => setCameraState({
      position: initPosition.clone(),
      rotation: initRotation.clone(),
      distance: initDistance
    }),
    [initPosition, initRotation, initDistance, setCameraState]
  );

  const handleChange = useCallback(
    (type: keyof CameraState, axis?: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseFloat(event.currentTarget.value);
      let typeState: any = (cameraState as any)[type];
      if (axis) {
        typeState = typeState.clone();
        typeState[axis] = value;
      }
      else {
        typeState = value;
      }
      setCameraState({
        ...cameraState,
        [type]: typeState
      });
    },
    [cameraState, setCameraState]
  );

  const handleSelectView = useCallback(
    ({value}: {value: string}) => setView(views.find(({name}) => name === value) as View),
    [views, setView]
  );

  const handleDownload = useCallback(
    () => {
      stage.viewer.getImage().then(
        (blob: Blob) => (
          mounted() &&
          makeDownload(`${pdb}.png`, 'image/png', blob, true)
        )
      );
    },
    [pdb, mounted, stage]
  );

  const viewOptions = useMemo(
    () => views.map(({name, label}) => ({
      value: name,
      label: (label as any) || name
    })),
    [views]
  );

  const curViewOption = useMemo(
    () => viewOptions.find(({value}) => value === currentViewName),
    [viewOptions, currentViewName]
  );

  useEffect(
    () => {
      handleReset();
    },
    [handleReset]
  );

  return React.useMemo(
    () => <>
      <div className={style['camera-options']}>
        {viewOptions.length > 1 ?
          <Select
           classNamePrefix="view-select"
           className={style['view-select']}
           options={viewOptions}
           name="view"
           value={curViewOption}
           onChange={handleSelectView} /> :
          <label className={style['view-select']}>
            {viewOptions[0].label || (viewOptions[0] as any).name}:
          </label>}
        <Button onClick={handleDownload} btnStyle="primary">
          Save image
        </Button>
        <Button onClick={handleReset} btnStyle="default">
          Reset camera
        </Button>
      </div>
      {verbose ? <>
        {cameraState?.position ?
          <ul className={style['camera-controll']}>
            {'xyz'.split('').map(axis => (
              <li key={`position-axis-input_${axis}`}>
                <label htmlFor={`position-axis-input_${axis}`}>
                  <strong>P{axis}</strong>
                  : {cameraState.position[axis].toFixed(1)}
                </label>
                <input
                 name={`position-axis-input_${axis}`}
                 type="range"
                 value={cameraState.position[axis]}
                 step="0.1"
                 min={positionBox.min[axis]}
                 max={positionBox.max[axis]}
                 onChange={handleChange('position', axis)} />
              </li>
            ))}
          </ul> : null}
        {cameraState?.rotation ?
          <ul className={style['camera-controll']}>
            {'xyzw'.split('').map(axis => (
              <li key={`rotation-axis-input_${axis}`}>
                <label htmlFor={`rotation-axis-input_${axis}`}>
                  <strong>R{axis}</strong>
                  : {cameraState.rotation[axis].toFixed(4)}
                </label>
                <input
                 name={`rotation-axis-input_${axis}`}
                 type="range"
                 value={cameraState.rotation[axis]}
                 step="0.01"
                 min="-1"
                 max="1"
                 onChange={handleChange('rotation', axis)} />
              </li>
            ))}
          </ul> : null}
        {cameraState?.distance !== undefined ?
          <ul className={style['camera-controll']}>
            <li key={`distance-axis-input`}>
              <label htmlFor={`distance-axis-input`}>
                <strong>Distance</strong>
                : {cameraState.distance.toFixed(1)}
              </label>
              <input
               name={`distance-axis-input`}
               type="range"
               value={cameraState.distance}
               step="0.1"
               min={initDistance - 200}
               max={initDistance + 200}
               onChange={handleChange('distance')} />
            </li>
          </ul> : null}
      </> : null}
    </>,
    [
      verbose,
      curViewOption,
      handleSelectView,
      viewOptions,
      positionBox,
      cameraState,
      handleReset,
      handleDownload,
      handleChange,
      initDistance
    ]
  );
}

