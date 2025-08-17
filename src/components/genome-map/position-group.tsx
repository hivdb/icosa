import React from 'react';

import Region from './region';
import Position from './position';
import type {MultiScale, PositionGroup as PositionGroupType, Regions} from './types';

export interface PositionGroupProps {
  /** Vertical offset for the group. */
  offsetY: number;
  /** Scaling function for the x-axis. */
  scaleX: MultiScale;
  /** Extra extension size for position pointers. */
  positionExtendSize?: number;
  /** Group definition containing positions. */
  positionGroup: PositionGroupType;
  /** Regions rendered within the group. */
  regions: Regions;
}

/**
 * Render a group of positions and regions within the genome map.
 */
export default function PositionGroup({
  offsetY,
  scaleX,
  positionExtendSize,
  positionGroup: {name, positions},
  regions
}: PositionGroupProps) {
  const [posStart, posEnd] = scaleX.domain();

  return <svg id={`position-group-${name}`} y={offsetY}>
    {regions.map(region => (
      <Region
       offsetY={0}
       key={`region-${region.name}`}
       scaleX={scaleX}
       region={region} />
    ))}
    {positions.map(({name, pos, ...posData}) => (
      pos >= posStart && pos <= posEnd &&
      <Position
       offsetY={0}
       key={`position-${pos}-${name}`}
       extendSize={positionExtendSize}
       position={{name, pos, ...posData}} />
    ))}
  </svg>;
}
