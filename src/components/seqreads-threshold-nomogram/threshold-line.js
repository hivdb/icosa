import React from 'react';
import PropTypes from 'prop-types';


ThresholdLine.propTypes = {
  direction: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
  scaleX: PropTypes.func.isRequired,
  scaleY: PropTypes.func.isRequired,
  threshold: PropTypes.number.isRequired,
  thresholdCmp: PropTypes.oneOf(['>', '<']).isRequired,
  strokeDasharray: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};


ThresholdLine.defaultProps = {
  strokeDasharray: '5,5'
};


export default function ThresholdLine({
  direction,
  scaleX,
  scaleY,
  threshold,
  thresholdCmp,
  strokeDasharray,
  color
}) {
  const uniqId = `threshold-${direction}-${thresholdCmp}${threshold}`;
  const lineProps = {
    strokeDasharray,
    stroke: color
  };
  const rectProps = {
    fill: `url(#${uniqId})`,
    opacity: .2
  };
  const gradientProps = {id: uniqId};
  if (direction === 'horizontal') {
    lineProps.y1 = scaleY(threshold);
    lineProps.y2 = lineProps.y1;
    [lineProps.x1, lineProps.x2] = scaleX.range();
    rectProps.x = lineProps.x1;
    rectProps.width = lineProps.x2 - lineProps.x1;
    gradientProps.x1 = 0;
    gradientProps.x2 = 0;
    if (thresholdCmp === '>') {
      rectProps.y = scaleY.range()[1];
      rectProps.height = lineProps.y1 - rectProps.y;
      gradientProps.y1 = 1;
      gradientProps.y2 = 0;
    }
    else {
      rectProps.y = lineProps.y1;
      rectProps.height = scaleY.range()[0] - rectProps.y;
      gradientProps.y1 = 0;
      gradientProps.y2 = 1;
    }
  }
  else {
    lineProps.x1 = scaleX(threshold);
    lineProps.x2 = lineProps.x1;
    [lineProps.y1, lineProps.y2] = scaleY.range();
    rectProps.y = lineProps.y2;
    rectProps.height = lineProps.y1 - lineProps.y2;
    gradientProps.y1 = 0;
    gradientProps.y2 = 0;
    if (thresholdCmp === '>') {
      rectProps.x = lineProps.x1;
      rectProps.width = scaleX.range()[1] - rectProps.x;
      gradientProps.x1 = 0;
      gradientProps.x2 = 1;
    }
    else {
      rectProps.x = scaleX.range()[0];
      rectProps.width = lineProps.x1 - rectProps.x;
      gradientProps.x2 = 0;
      gradientProps.x1 = 1;
    }
  }
  return <g>
    <defs>
      <linearGradient {...gradientProps}>
        <stop offset="0%" opacity="0.2" stop-color={color} />
        <stop offset="100%" opacity="0" stop-color="#fff" />
      </linearGradient>
    </defs>
    <line {...lineProps} />
    <rect {...rectProps} />
  </g>;
}
