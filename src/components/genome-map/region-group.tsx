import React from 'react';

import PositionAxis from './position-axis';
import PositionGroup from './position-group';
import CoverageLayer from './coverage-layer';
import type {Coverages, MultiScale, PositionGroup as PositionGroupType, PositionAxis as PositionAxisConfig, Regions} from './types';

const POS_GROUP_MIN_HEIGHT = 75;
const POS_LABEL_HEIGHT_RATIO = 7;

export interface RegionGroupProps {
  /** X-axis scale function. */
  scaleX: MultiScale;
  /** Padding above the first group. */
  paddingTop: number;
  /** Position groups to render. */
  positionGroups: PositionGroupType[];
  /** Whether to hide the position axis. */
  hidePositionAxis?: boolean;
  /** Configuration for the position axis. */
  positionAxis?: PositionAxisConfig;
  /** Extension size for position pointers. */
  positionExtendSize?: number;
  /** Height of the position axis. */
  positionAxisHeight: number;
  /** Regions shared across groups. */
  regions: Regions;
  /** Optional coverage layer. */
  coverages?: Coverages;
}

/**
 * Render groups of genomic positions along with optional coverage and axis.
 */
export default function RegionGroup({
  scaleX,
  paddingTop,
  positionGroups,
  hidePositionAxis = false,
  positionAxis,
  positionExtendSize,
  positionAxisHeight,
  regions,
  coverages
}: RegionGroupProps) {
  const hasCoverages = !!coverages;
  const coveragesHeight = hasCoverages ? coverages.height : 0;

  const [posStart, posEnd] = scaleX.domain();

  const allPosGroupProps = React.useMemo(() => {
    let posGroupAddOffsetY = 0;
    if (hasCoverages) {
      posGroupAddOffsetY += coveragesHeight;
    }
    else if (!hidePositionAxis) {
      posGroupAddOffsetY += positionAxisHeight;
    }

    const allPosGroupProps = [] as Array<{positionGroup: PositionGroupType; offsetY: number}>;
    for (const posGroup of positionGroups) {
      const longestPosLabelLen = Math.max(
        0,
        ...posGroup.positions.map(({name, label}) => (
          typeof label === 'undefined' ? name : label
        ).length)
      );
      allPosGroupProps.push({
        positionGroup: posGroup,
        offsetY: paddingTop + posGroupAddOffsetY
      });
      posGroupAddOffsetY += (
        (posGroup.addOffsetY || 0) +
        longestPosLabelLen * POS_LABEL_HEIGHT_RATIO +
        POS_GROUP_MIN_HEIGHT
      );
    }
    return allPosGroupProps;
  }, [
    hasCoverages,
    coveragesHeight,
    hidePositionAxis,
    paddingTop,
    positionGroups,
    positionAxisHeight
  ]);

  return <g id={`region-group-${posStart}_${posEnd}`}>
    {hasCoverages ? (
      <CoverageLayer
       {...coverages!}
       scaleX={scaleX}
       offsetY={paddingTop} />
    ) : null}
    {hidePositionAxis ? null : <PositionAxis
     offsetY={paddingTop}
     scaleX={scaleX}
     positionAxis={positionAxis} />}
    {allPosGroupProps.map(({positionGroup, ...rest}) => (
      <PositionGroup
       key={`position-group-${positionGroup.name}`}
       positionExtendSize={positionExtendSize}
       regions={regions}
       scaleX={scaleX}
       positionGroup={positionGroup}
       {...rest} />
    ))}
  </g>;
}
