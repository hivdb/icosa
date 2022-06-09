import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Markdown from '../markdown';
import DownloadSVG from '../download-svg';

import {presetShape} from './prop-types';
import RegionGroup from './region-group';
import {
  getLongestPosLabelHeight,
  scaleMultipleLinears,
  trimOverlaps
} from './helpers';

import style from './style.module.scss';

export {presetShape};

const MARGIN = 120;
const POS_GROUP_MIN_HEIGHT = 75;
const POS_AXIS_HEIGHT = 25;

GenomeMap.propTypes = {
  className: PropTypes.string,
  extraButtons: PropTypes.node,
  preset: presetShape.isRequired
};

export default function GenomeMap({
  className,
  extraButtons,
  preset
}) {

  const svgRef = React.useRef();
  const {
    name,
    paddingTop,
    domains,
    hidePositionAxis,
    positionAxis,
    positionGroups,
    positionExtendSize,
    regions,
    coverages,
    footnote,
    height: minHeight,
    width: minWidth,
    paddingLeft: minPaddingLeft,
    paddingRight: minPaddingRight
  } = preset;

  const origScaleX = React.useMemo(
    () => scaleMultipleLinears(
      domains,
      [minPaddingLeft, minWidth - minPaddingRight]
    ),
    [domains, minPaddingLeft, minPaddingRight, minWidth]
  );

  const origTrimmedPosGroups = React.useMemo(
    () => positionGroups.map(
      posGroup => trimOverlaps(posGroup, origScaleX)
    ),
    [positionGroups, origScaleX]
  );

  const [minX, maxX] = React.useMemo(
    () => {
      const [posStart, posEnd] = origScaleX.domain();
      let minX = 0;
      let maxX = minWidth;
      for (const {positions} of origTrimmedPosGroups) {
        for (const {pos, turns} of positions) {
          if (pos < posStart || pos > posEnd) {
            continue;
          }
          for (const [x] of turns) {
            if (x < minX) {
              minX = x;
            }
            else if (x > maxX) {
              maxX = x;
            }
          }
        }
      }
      return [minX, maxX];
    },
    [origScaleX, origTrimmedPosGroups, minWidth]
  );

  const width = maxX - minX + 2 * MARGIN;
  const paddingLeft = -minX + MARGIN;
  const paddingRight = maxX - minWidth + MARGIN;

  const scaleX = React.useMemo(
    () => scaleMultipleLinears(
      domains,
      [paddingLeft, width - paddingRight]
    ),
    [domains, paddingLeft, paddingRight, width]
  );

  const trimmedPosGroups = React.useMemo(
    () => positionGroups.map(
      posGroup => trimOverlaps(posGroup, scaleX)
    ),
    [positionGroups, scaleX]
  );

  const hasCoverages = !!coverages;
  const coveragesHeight = hasCoverages ? coverages.height : 0;

  const height = React.useMemo(
    () => {
      let height = paddingTop + 10;
      if (hasCoverages) {
        height += coveragesHeight;
      }
      else if (!hidePositionAxis) {
        height += POS_AXIS_HEIGHT;
      }

      for (const posGroup of trimmedPosGroups) {
        height += (
          posGroup.addOffsetY +
          getLongestPosLabelHeight(posGroup.positions) +
          POS_GROUP_MIN_HEIGHT
        );
      }
      return Math.max(minHeight, height);
    },
    [
      minHeight,
      hasCoverages,
      coveragesHeight,
      hidePositionAxis,
      paddingTop,
      trimmedPosGroups
    ]
  );

  return <div className={classNames(
    style['map-container'],
    className
  )}>
    <div className={style['button-group']}>
      {extraButtons}
      <DownloadSVG
       css="none"
       btnSize="small"
       btnStyle="primary"
       target={svgRef}
       fileName={`${name}.svg`} />
    </div>
    <div className={style['svg-container']}>
      <svg
       ref={svgRef}
       fontFamily='"Source Sans Pro", "Helvetica Neue", Helvetica'
       style={{minHeight: `${height / 2}px`}}
       viewBox={`0 0 ${width} ${height}`}>
        <RegionGroup
         scaleX={scaleX}
         paddingTop={paddingTop}
         positionGroups={trimmedPosGroups}
         hidePositionAxis={hidePositionAxis}
         positionAxis={positionAxis}
         positionExtendSize={positionExtendSize}
         positionAxisHeight={POS_AXIS_HEIGHT}
         regions={regions}
         coverages={coverages} />
      </svg>
    </div>
    {footnote && <div className={style.footnote}>
      <Markdown escapeHtml={false}>{footnote}</Markdown>
    </div>}
  </div>;
}
