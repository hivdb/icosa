import React from 'react';
import PropTypes from 'prop-types';
import {
  Rotation,
  useComponent
} from 'react-ngl';

import Button from '../button';

import {cameraStateShape} from './prop-types';
import style from './style.module.scss';


CameraController.propTypes = {
  verbose: PropTypes.bool,
  cameraState: cameraStateShape,
  defaultCameraState: cameraStateShape,
  setCameraState: PropTypes.func.isRequired
};

export default function CameraController({
  verbose,
  cameraState,
  defaultCameraState,
  setCameraState
}) {
  const component = useComponent();
  const initPosition = React.useMemo(
    () => (
      defaultCameraState?.position ||
      component.getCenter().multiplyScalar(-1)
    ),
    [defaultCameraState?.position, component]
  );
  const initRotation = React.useMemo(
    () => defaultCameraState?.rotation || new Rotation(0, 0, 0, 1),
    [defaultCameraState?.rotation]
  );
  const initDistance = React.useMemo(
    () => defaultCameraState?.distance || component.getZoom(),
    [defaultCameraState?.distance, component]
  );
  const positionBox = React.useMemo(
    () => {
      const {min, max} = component.getBox();
      return {
        min: max.multiplyScalar(-1),
        max: min.multiplyScalar(-1)
      };
    },
    [component]
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

  React.useEffect(
    () => {
      handleReset();
    },
    [handleReset]
  );

  return React.useMemo(
    () => <>
      <ul className={style['camera-controll']}>
        <li>
          <Button onClick={handleReset} btnStyle="primary">
            Reset camera
          </Button>
        </li>
      </ul>
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
      positionBox,
      cameraState,
      handleReset,
      handleChange,
      initDistance
    ]
  );
}
