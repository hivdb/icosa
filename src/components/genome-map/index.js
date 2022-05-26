import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {presetShape} from './prop-types';
import RegionGroup from './region-group';
import Markdown from '../markdown';
import DownloadSVG from '../download-svg';

import style from './style.module.scss';

export {presetShape};


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
    subregionGroup,
    footnote,
    height,
    width,
    paddingLeft,
    paddingRight
  } = preset;
  const [svgBorder, setSVGBorder] = React.useState({
    height,
    width,
    paddingLeft,
    paddingRight
  });
  const mounted = React.useRef(true);

  React.useEffect(
    () => (() => mounted.current = false),
    []
  );

  const moveSVGBorder = React.useCallback(
    ({height, width, paddingLeft, paddingRight}) => {
      if (mounted.current && height > svgBorder.height) {
        setSVGBorder({height, width, paddingLeft, paddingRight});
      }
    },
    [svgBorder.height]
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
       viewBox={`0 0 ${svgBorder.width} ${svgBorder.height}`}>
        <RegionGroup
         paddingTop={paddingTop}
         paddingRight={svgBorder.paddingRight}
         paddingLeft={svgBorder.paddingLeft}
         width={svgBorder.width}
         domains={domains}
         hidePositionAxis={hidePositionAxis}
         positionAxis={positionAxis}
         positionGroups={positionGroups}
         positionExtendSize={positionExtendSize}
         regions={regions}
         coverages={coverages}
         moveSVGBorder={moveSVGBorder}
         subregionGroup={subregionGroup} />
      </svg>
    </div>
    {footnote && <div className={style.footnote}>
      <Markdown escapeHtml={false}>{footnote}</Markdown>
    </div>}
  </div>;
}
