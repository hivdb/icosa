import React from 'react';
import PropTypes from 'prop-types';
import {
  Rotation,
  useStage,
  useComponent
} from 'react-ngl';

import Select from '../select';
import Button from '../button';
import {makeDownload} from '../../utils/download';
import useMounted from '../../utils/use-mounted';

import {viewShape, cameraStateShape} from './prop-types';
import style from './style.module.scss';


CameraController.propTypes = {
  pdb: PropTypes.string.isRequired,
  sele: PropTypes.string,
  verbose: PropTypes.bool,
  currentViewName: PropTypes.string.isRequired,
  views: PropTypes.arrayOf(viewShape.isRequired).isRequired,
  setView: PropTypes.func.isRequired,
  cameraState: cameraStateShape,
  defaultCameraState: cameraStateShape,
  setCameraState: PropTypes.func.isRequired
};

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
}) {
  const stage = useStage();
  const component = useComponent();
  const mounted = useMounted();
  const initPosition = React.useMemo(
    () => (
      defaultCameraState?.position ||
      component.getCenter(sele).multiplyScalar(-1)
    ),
    [defaultCameraState?.position, component, sele]
  );
  const initRotation = React.useMemo(
    () => defaultCameraState?.rotation || new Rotation(0, 0, 0, 1),
    [defaultCameraState?.rotation]
  );
  const initDistance = React.useMemo(
    () => defaultCameraState?.distance || component.getZoom(sele),
    [defaultCameraState?.distance, component, sele]
  );
  const positionBox = React.useMemo(
    () => {
      const {min, max} = component.getBox(sele);
      return {
        min: max.multiplyScalar(-1),
        max: min.multiplyScalar(-1)
      };
    },
    [component, sele]
  );

  const handleReset = React.useCallback(
    () => setCameraState({
      position: initPosition.clone(),
      rotation: initRotation.clone(),
      distance: initDistance
    }),
    [initPosition, initRotation, initDistance, setCameraState]
  );

  const handleChange = React.useCallback(
    (type, axis) => event => {
      const value = Number.parseFloat(event.currentTarget.value);
      let typeState = cameraState[type];
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

  const handleSelectView = React.useCallback(
    ({value}) => setView(views.find(({name}) => name === value)),
    [views, setView]
  );

  const handleDownload = React.useCallback(
    () => {
      stage.viewer.getImage().then(
        blob => (
          mounted() &&
          makeDownload(`${pdb}.png`, 'image/png', blob, true)
        )
      );
    },
    [pdb, mounted, stage]
  );

  const viewOptions = React.useMemo(
    () => views.map(({name, label}) => ({
      value: name,
      label: label || name
    })),
    [views]
  );

  const curViewOption = React.useMemo(
    () => viewOptions.find(({value}) => value === currentViewName),
    [viewOptions, currentViewName]
  );

  React.useEffect(
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
          (viewOptions[0].label || viewOptions[0].name)}
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
