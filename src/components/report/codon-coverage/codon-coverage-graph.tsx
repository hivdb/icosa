import React, { useMemo, useRef } from 'react';
import { AxisBottom, AxisLeft } from '@vx/axis';
import { Group } from '@vx/group';
import { Line } from '@vx/shape';
import { scaleBand, scaleLinear } from '@vx/scale';
import {
  withTooltip,
  Tooltip,
  WithTooltipProvidedProps
} from '@vx/tooltip';
import { range } from 'd3-array';
import { FaAngleDoubleRight } from '@react-icons/all-files/fa/FaAngleDoubleRight';

import config from '../../../config.js';
import {
  Genes,
  CodonReadsCoverage,
  CodonReadsCoverageItem
} from './types';
import style from './style.module.scss';

const colors = {
  stroke: '#ffffff', // white
  fill: '#24b298', // jungleGreen
  fillTrimmed: '#bbbbbb', // silver
  dashedDividingLine: '#1c1b1c' // thunder
};

const margin = { top: 10, right: 0, bottom: 40, left: 40 };
const height = 420;

/**
 * Generate evenly distributed tick values within a range.
 *
 * @param start - start position of the range
 * @param end - end position of the range
 * @param tick - desired number of ticks
 * @returns Array of tick values
 */
function ticks(start: number, end: number, tick: number): number[] {
  let step = parseInt((end + 1 - start) / (tick - 1), 10);
  step = parseInt((step + 3) / 5, 10) * 5;
  const r: number[] = [];
  const istart = parseInt(start / 5, 10) * 5;
  for (let i = istart; i < end - 7; i += step) {
    if (i > start) {
      r.push(i);
    }
  }
  return r;
}

interface GraphProps {
  data: Array<{
    x: number;
    y: number;
    position: string;
    totalReads: number;
    fill: string;
  }>;
  firstPos: number;
  lastPos: number;
  width: number;
  yMax: number;
  xAxisTickValues: number[];
  yAxisTickValues: number[];
}

interface CodonCoverageProps
  extends WithTooltipProvidedProps<{ position: string; totalReads: number }> {
  genes: Genes;
  codonReadsCoverage: CodonReadsCoverage;
  containerWidth: number;
  minPositionReads: number;
}

/**
 * Visualize codon read coverage for each gene as a bar chart.
 *
 * @param props - {@link CodonCoverageProps} component properties
 * @returns Rendered JSX element
 */
const CodonCoverageGraph: React.FC<CodonCoverageProps> = ({
  genes,
  codonReadsCoverage,
  containerWidth,
  minPositionReads,
  showTooltip,
  hideTooltip,
  tooltipOpen,
  tooltipData,
  tooltipTop,
  tooltipLeft
}) => {
  const mainGRef = useRef<HTMLDivElement | null>(null);

  const graphProps = useMemo<GraphProps>(() => {
    let yMax = 0;
    const coverageMap = codonReadsCoverage.reduce<Record<string, Omit<CodonReadsCoverageItem, 'gene' | 'position'>>>(
      (acc, { gene: { name: gene }, position, ...value }) => {
        acc[`${gene}:${position}`] = value;
        return acc;
      },
      {}
    );

    const barData: GraphProps['data'] = [];
    let geneOffset = 0;
    const xAxisTickValues: number[] = [];
    for (const { name: gene, length } of genes) {
      for (let pos = 1; pos <= length; pos++) {
        const genePos = `${gene}:${pos}`;
        const genePosValue =
          genePos in coverageMap
            ? coverageMap[genePos]
            : { totalReads: 0, isTrimmed: false };
        const { totalReads, isTrimmed } = genePosValue;
        if (yMax < totalReads) {
          yMax = totalReads;
        }
        barData.push({
          x: geneOffset + pos,
          y: totalReads,
          position: genePos,
          totalReads,
          fill: isTrimmed ? colors.fillTrimmed : colors.fill
        });
      }
      xAxisTickValues.push(1 + geneOffset);
      for (let i = 10; i < length; i += 10) {
        xAxisTickValues.push(i + geneOffset);
      }
      geneOffset += length;
    }
    const lenAA = geneOffset + 1;
    const scale = containerWidth / (lenAA + 40);
    const width = Math.max(
      Math.sqrt(
        2 * (containerWidth - margin.left - margin.right) * scale * lenAA -
          Math.pow(scale * lenAA, 2)
      ),
      400
    );
    xAxisTickValues.push(geneOffset);
    const yAxisTickValues = ticks(0, yMax, parseInt(height / 20, 10));
    yAxisTickValues.push(0);
    return {
      data: barData,
      firstPos: 1,
      lastPos: geneOffset,
      width,
      yMax,
      xAxisTickValues,
      yAxisTickValues
    };
  }, [genes, codonReadsCoverage, containerWidth]);

  const genePosRanges = useMemo<Array<[string, number, number]>>(() => {
    const rangeArr: Array<[string, number, number]> = [];
    let geneOffset = 1;
    for (const { name: gene, length } of genes) {
      rangeArr.push([gene, geneOffset, geneOffset + length]);
      geneOffset += length;
    }
    return rangeArr;
  }, [genes]);

  const { firstPos, lastPos, data, xAxisTickValues, yAxisTickValues } = graphProps;
  const width = containerWidth;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    range: [firstPos, graphProps.width],
    domain: [firstPos, lastPos]
  });
  const xScaleBandDomain: number[] = [];
  for (let i = firstPos; i <= lastPos; i++) {
    xScaleBandDomain.push(i);
  }
  const xScaleband = scaleBand({
    range: [firstPos, graphProps.width],
    domain: range(firstPos, lastPos + 1),
    padding: 0
  });
  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, graphProps.yMax]
  });

  const xPoint = (d: { x: number }) => xScale(d.x);
  const yPoint = (d: { y: number }) => yScale(d.y);

  const barWidth = xScaleband.bandwidth();
  const yCutoff = yScale(minPositionReads);

  return (
    <>
      <div className={style.instruction}>
        Scroll right for more <FaAngleDoubleRight />
      </div>
      <svg
        className={style['left-axis']}
        width={margin.left + 1}
        height={height + margin.top + margin.bottom}
      >
        <AxisLeft
          scale={yScale}
          top={margin.top}
          left={margin.left}
          stroke={colors.dividingLine}
          tickStroke={colors.dividingLine}
          tickValues={yAxisTickValues}
          tickLabelProps={() => ({
            dx: '-0.2em',
            dy: '0.3em',
            textAnchor: 'end',
            fontSize: 9,
            fill: 'black'
          })}
        />
      </svg>
      <div ref={mainGRef} className={style['main-graph-container']}>
        <svg width={width} height={height + margin.top + margin.bottom}>
          <Group top={margin.top} left={0}>
            {genePosRanges.map(([gene, start, end], idx) => {
              const x0 = xScale(start);
              const x1 = xScale(end);
              return (
                <rect
                  strokeDasharray="3,3"
                  x={x0}
                  width={x1 - x0}
                  y={0}
                  height={yMax}
                  fill={config.seqReadsCodonCovBgColors[gene]}
                  key={idx}
                />
              );
            })}
            {data.map((d, i) => {
              const barHeight = yMax - yPoint(d);
              return (
                <rect
                  key={`bar-${i}`}
                  x={xPoint(d)}
                  y={yMax - barHeight}
                  fill={d.fill}
                  stroke={colors.stroke}
                  strokeDasharray={`0 ${barWidth} ${barHeight} ${barWidth} ${barHeight}`}
                  strokeWidth="0.01%"
                  width={barWidth}
                  height={barHeight}
                  onMouseMove={(event) => {
                    const container = mainGRef.current?.parentElement;
                    const left = container
                      ? event.pageX - container.offsetLeft + 15
                      : 0;
                    const top = container
                      ? event.pageY - container.offsetTop - 5
                      : 0;
                    const { position, totalReads } = d;
                    showTooltip({
                      tooltipData: { position, totalReads },
                      tooltipTop: top,
                      tooltipLeft: left
                    });
                  }}
                  onMouseLeave={() => hideTooltip()}
                />
              );
            })}
            {genePosRanges.map(([, value], idx) => {
              if (value === 1) {
                return null;
              }
              const x = xScale(value);
              return (
                <Line
                  strokeDasharray="3,3"
                  from={{ x, y: 0 }}
                  to={{ x, y: yMax }}
                  strokeWidth={1}
                  key={idx}
                  stroke={colors.dashedDividingLine}
                />
              );
            })}
            <Line
              strokeDasharray="5,5"
              from={{ x: 0, y: yCutoff }}
              to={{ x: xScale(lastPos), y: yCutoff }}
              strokeWidth={1}
              stroke={colors.dashedDividingLine}
            />
          </Group>
          <AxisBottom
            top={yMax + margin.top}
            left={barWidth / 2}
            scale={xScale}
            stroke={colors.dividingLine}
            tickStroke={colors.dividingLine}
            tickValues={xAxisTickValues}
            tickFormat={(pos) => {
              for (const [gene, start, end] of genePosRanges) {
                if (pos >= start && pos < end) {
                  const relPos = pos - start + 1;
                  return `${gene}:${relPos}`;
                }
              }
            }}
            tickLabelProps={(val) => ({
              fontSize: 11,
              textAnchor: 'start',
              transform: `rotate(90 ${xScale(val as number) + barWidth / 2} 15.5)`
            })}
          />
        </svg>
      </div>
      <div className={style.footnote}>
        Horizontal dashed line: minimal read depth; Vertical dashed lines:
        borders of different genes.
      </div>
      {tooltipOpen && (
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
          Codon Position {tooltipData.position}{' '}
          (n={tooltipData.totalReads.toLocaleString()})
        </Tooltip>
      )}
    </>
  );
};

export default withTooltip<CodonCoverageProps, { position: string; totalReads: number }>(CodonCoverageGraph);
