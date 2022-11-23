import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';
import USAnnotGroup from './underscore-annot-group';

import {posShape} from '../../../prop-types';


HoverLayer.propTypes = {
  hoverPos: PropTypes.number,
  hoverUSAnnot: PropTypes.shape({
    annotName: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number
  }).isRequired,
  activePos: PropTypes.number,
  anchorPos: PropTypes.number,
  config: PropTypes.object.isRequired,
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired
};

export default function HoverLayer({
  hoverPos,
  hoverUSAnnot,
  activePos,
  anchorPos,
  config,
  positionLookup
}) {
  const layerRef = React.useRef();

  const positions = React.useMemo(
    () => {
      const {annotName} = hoverUSAnnot;
      const {seqFragment: [posStart, posEnd]} = config;
      if (annotName) {
        return (
          Object.values(positionLookup)
            .filter(
              ({annotations}) => annotations.find(
                ({name}) => name === annotName
              )
            )
            .map(({position}) => position)
        );
      }
      const positions = [];
      if (hoverPos) {
        positions.push(hoverPos);
      }
      if (activePos && activePos !== hoverPos) {
        positions.push(activePos);
      }
      if (anchorPos && !positions.includes(anchorPos)) {
        positions.push(anchorPos);
      }
      return positions.filter(p => p >= posStart && p <= posEnd);
    },
    [activePos, anchorPos, config, hoverPos, hoverUSAnnot, positionLookup]
  );

  return <Layer ref={layerRef}>
    {positions.map(pos => (
      <PositionGroup position={pos} config={config} key={pos} />
    ))}
    {hoverUSAnnot.annotName ?
      <USAnnotGroup {...hoverUSAnnot} config={config} /> : null}
  </Layer>;
}
