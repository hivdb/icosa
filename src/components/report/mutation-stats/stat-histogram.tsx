import React from 'react';
import {Text} from '@vx/text';
import {Group} from '@vx/group';
import {AxisLeft, AxisBottom} from '@vx/axis';
import {withTooltip, Tooltip, TooltipWithBounds} from '@vx/tooltip';
import {scaleBand, scaleLinear} from 'd3-scale';

import {SitesType, Site} from './types';
import style from './style.module.scss';

const margin = {top: 50, right: 0, bottom: 10, left: 80};

const colors = {
  usualSites: '#bbbbbb', // dustygray
  unusualSites: '#e13333', // cinnabar
  pcntUnusualSites: '#e13333', // cinnabar
  ratio: '#f5cc00' // supernova
};

/**
 * Derive a percent label from a site description.
 *
 * @param d - Site object containing percentage boundaries.
 * @returns Percent label string.
 */
function getPercent(d: Omit<Site, 'count'> | {percent: string}): string {
  if ('percent' in d) {
    return d.percent;
  }
  return `${Number(d.percentStart.toPrecision(1))}%`;
}

/**
 * Generate a human readable ratio description for tooltip display.
 *
 * @param d - Chart datum containing counts for usual and unusual sites.
 * @returns Ratio description string.
 */
function getRatioDesc(d: {unusualSites: number; usualSites: number}): string {
  let r = (1.0 * d.unusualSites) / d.usualSites;
  if (isNaN(r)) {
    r = 0;
  }
  const rDesc = `${(r * 100).toFixed(0)}%`;

  if (r <= 0.5) {
    return rDesc;
  }
  if (r <= 1) {
    return `> 50% (${rDesc})`;
  }
  return `>> 50% (${rDesc})`;
}

export interface SequenceReadsHistogramProps {
  /** Sites considered usual. */
  usualSites: SitesType;
  /** Sites considered drug-resistance mutations. */
  drmSites: SitesType;
  /** Sites considered unusual. */
  unusualSites: SitesType;
  /** Sites considered unusual APOBEC mutations. */
  unusualApobecSites: SitesType;
  /** Total number of positions examined. */
  numPositions: number;
  /** Tooltip display helper. */
  showTooltip?: React.ComponentProps<typeof TooltipWithBounds>['showTooltip'];
  /** Tooltip hide helper. */
  hideTooltip?: () => void;
  /** Whether tooltip is open. */
  tooltipOpen?: boolean;
  /** Tooltip payload. */
  tooltipData?: any;
  /** Tooltip top offset. */
  tooltipTop?: number;
  /** Tooltip left offset. */
  tooltipLeft?: number;
}

/**
 * Render a histogram comparing usual and unusual site counts across cutoffs.
 *
 * @param props - {@link SequenceReadsHistogramProps} describing dataset and tooltip handlers.
 * @returns SVG wrapped in a div containing the histogram.
 */
function SequenceReadsHistogram({
  usualSites,
  drmSites,
  unusualSites,
  unusualApobecSites,
  numPositions,
  showTooltip = () => undefined,
  hideTooltip = () => undefined,
  tooltipOpen = false,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0
}: SequenceReadsHistogramProps) {
  const chartData = React.useMemo(() => {
    const result: Record<string, any> = {};
    let index = 0;
    for (const {count, ...s} of usualSites) {
      const percent = getPercent(s);
      result[percent] = {
        percent,
        usualSites: count,
        index: index++
      };
    }
    for (const {count, ...s} of drmSites) {
      const percent = getPercent(s);
      result[percent].drmSites = count;
    }
    for (const {count, ...s} of unusualSites) {
      const percent = getPercent(s);
      result[percent].unusualSites = count;
      result[percent].pcntUnusualSites = (count / numPositions) * 100;
    }
    for (const {count, ...s} of unusualApobecSites) {
      const percent = getPercent(s);
      result[percent].unusualApobecSites = count;
    }
    return Object.values(result);
  }, [usualSites, drmSites, unusualSites, unusualApobecSites, numPositions]);

  const width = 400;
  const height = 290;
  const halfGapH = 6;

  const xMax = width;
  const yMax = height - 20;
  const gapY = (yMax / 5) * 2;
  const yCutoff = 5.0;

  const xScale = scaleBand<string>()
    .domain(chartData.map(getPercent))
    .padding(0.1)
    .rangeRound([0, xMax]);

  const lowerYScale = scaleLinear()
    .domain([0, yCutoff])
    .range([yMax, gapY + halfGapH]);

  const upperYScale = scaleLinear()
    .domain([yCutoff, 100])
    .range([gapY - halfGapH, 0]);

const combinedYScale = (value: number): number =>
  value > yCutoff ? upperYScale(value) : lowerYScale(value);

  const barWidth = xScale.bandwidth();

  return (
    <div className={style['stat-histogram']}>
      <svg
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      >
        <defs>
          <pattern
            id="rectGapPattern"
            x="0"
            y="0"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="-1"
              y1="4"
              x2="4"
              y2="-1"
              fill="transparent"
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="5"
              y1="2"
              x2="2"
              y2="5"
              fill="transparent"
              stroke="white"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <Group top={25} left={(width + margin.left + margin.right) / 2}>
          <Text textAnchor="middle" fontWeight="bolder">
            % Unusual Mutations at Different Cutoffs
          </Text>
        </Group>
        <Group top={margin.top} left={margin.left}>
          {chartData.map((group, idx) => {
            const x = xScale(getPercent(group)) ?? 0;
            const y = combinedYScale(group.pcntUnusualSites ?? 0);
            let gap: React.ReactNode = null;
            if (y < gapY) {
              gap = (
                <rect
                  key={`gap-${idx}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={gapY - y + halfGapH * 1}
                  fill="url(#rectGapPattern)"
                />
              );
            }
            return (
              <Group
                key={idx}
                onMouseMove={() =>
                  showTooltip({
                    tooltipData: group,
                    tooltipTop: y - 40,
                    tooltipLeft: x
                  })
                }
                onMouseLeave={() => hideTooltip()}
              >
                <rect
                  key={`bar-${idx}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={yMax - y}
                  fill={colors.pcntUnusualSites}
                  data-value={group.pcntUnusualSites}
                />
                {gap}
              </Group>
            );
          })}
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          scale={xScale}
          tickLabelProps={() => ({ fontSize: 14, textAnchor: 'middle' })}
        />
        <Group top={margin.top} left={margin.left}>
          <path
            d={`M0,0 L0,${gapY - halfGapH} ${halfGapH},${gapY} 0,${gapY +
              halfGapH} 0 ${yMax}`}
            stroke="black"
            fill="transparent"
            strokeWidth="1"
          />
        </Group>
        <AxisLeft
          top={margin.top}
          left={margin.left}
          hideAxisLine
          tickValues={[20, 50, 100]}
          scale={upperYScale}
          tickFormat={value => `${Number((value as number).toPrecision(1))}%`}
          tickLabelProps={() => ({
            fontSize: 12,
            textAnchor: 'end',
            dx: '-0.5em',
            dy: '0.25em'
          })}
        />
        <AxisLeft
          top={margin.top}
          left={margin.left}
          hideAxisLine
          tickValues={[1, 2, 3, 4, 5]}
          scale={lowerYScale}
          tickFormat={value => `${Number((value as number).toPrecision(1))}%`}
          tickLabelProps={() => ({
            fontSize: 12,
            textAnchor: 'end',
            dx: '-0.5em',
            dy: '0.25em'
          })}
        />
      </svg>
      {tooltipOpen ? (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            position: 'absolute',
            minWidth: 60,
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          <div>
            <strong># Usuals</strong>: {tooltipData.usualSites}
          </div>
          <div>
            <strong># DRMs</strong>: {tooltipData.drmSites}
          </div>
          <div>
            <strong># Unusuals</strong>: {tooltipData.unusualSites}{' '}
            ({tooltipData.pcntUnusualSites.toFixed(1)}%)
          </div>
          <div>
            <strong># Unusual & APOBECs</strong>: {tooltipData.unusualApobecSites}
          </div>
          <div>
            <strong>Unusual / Usual Ratio</strong>: {getRatioDesc(tooltipData)}
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

export default withTooltip(SequenceReadsHistogram);
