import React from 'react';
import {Layer} from 'react-konva';

import PositionGroup from './position-group';
import USAnnotGroup from './underscore-annot-group';

import type {Position} from '../../../prop-types';

interface HoverLayerProps {
  hoverPos?: number;
  hoverUSAnnot: {annotName?: string; x?: number; y?: number};
  activePos?: number;
  anchorPos?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  positionLookup: Record<number, Position>;
}

/**
 * Overlay showing hovered positions and underscore annotation tooltips.
 */
export default function HoverLayer({
  hoverPos,
  hoverUSAnnot,
  activePos,
  anchorPos,
  config,
  positionLookup
}: HoverLayerProps) {
  const layerRef = React.useRef(null);

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
