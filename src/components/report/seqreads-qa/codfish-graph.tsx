import React, { useEffect, useMemo, useRef } from 'react';
import { Group } from '@vx/group';
import { Line } from '@vx/shape';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { scaleBand, scaleLinear } from 'd3-scale';

import style from './style.module.scss';

const margin = { top: 10, right: 0, bottom: 50, left: 50 };

const colorPalettes = [
  '#c0c0c0',
  '#e13333', // cinnabar
  '#efa244', // orange
  '#1b8ecc' // blue
];

export interface CodfishRecord {
  gene: string;
  ref: string;
  pos: number;
  aa: string;
  cd: string;
  pcnt: number;
  isUnusual: boolean;
  accumScore: number;
  isDRM?: boolean;
}

export interface CodfishGraphProps {
  /** Array of codon-fish records */
  extCodfish: CodfishRecord[];
}

/**
 * Render an accumulated codon-fish graph.
 *
 * @param props - {@link CodfishGraphProps} component properties
 * @returns Rendered JSX element
 */
const CodfishGraph: React.FC<CodfishGraphProps> = ({ extCodfish }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const bars = useMemo(
    () =>
      extCodfish.map((r) => ({
        value: r.pcnt,
        mutation: `${r.gene}:${r.ref}${r.pos}${r.aa}$$${r.cd}`,
        color: colorPalettes[r.isUnusual ? 1 : 0],
        accumScore: r.accumScore,
        codon: r.cd,
        footnote: r.isDRM ? '*' : null
      })),
    [extCodfish]
  );

  useEffect(() => {
    // Scroll container to bottom after render to show latest bars
    const target = containerRef.current;
    if (target) {
      target.scrollTop = target.scrollHeight;
    }
  }, [bars.length]);

  const yTicks = [0, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];

  const width = 16 * bars.length;
  const height = 4000;
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - 20;

  const xScale = scaleBand()
    .domain(bars.map(({ mutation }) => mutation))
    .padding(0.1)
    .range([0, xMax]);
  const yScale = scaleLinear().domain([0, 1]).range([yMax, 0]);
  const barWidth = xScale.bandwidth();

  return (
    <div className={style['codfish-graph']} ref={containerRef}>
      <svg
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      >
        <Group top={margin.top} left={margin.left}>
          {bars.map(({ value, mutation, color, footnote }, idx) => {
            const x = xScale(mutation) ?? 0;
            const y = yScale(value);
            return (
              <Group key={idx} top={0} left={x}>
                <rect x={0} y={y} width={barWidth} height={yMax - y} fill={color} />
                {footnote ? (
                  <circle
                    fill={colorPalettes[3]}
                    r={4}
                    cx={barWidth / 2}
                    cy={y - 6}
                  />
                ) : null}
              </Group>
            );
          })}
          {yTicks.map((value, idx) => {
            const y = yScale(value);
            return (
              <Line
                strokeDasharray="5,5"
                from={{ x: 0, y }}
                to={{ x: xMax, y }}
                stroke="grey"
                key={idx}
              />
            );
          })}
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          left={margin.left}
          scale={xScale}
          tickFormat={(mut) => (mut as string).split('$$')[0]}
          tickLabelProps={(value) => ({
            fontSize: 11,
            textAnchor: 'start',
            transform: `rotate(90 ${
              (xScale(value as string) ?? 0) + barWidth / 2
            } 15.5)`
          })}
        />
        <AxisLeft
          top={margin.top}
          left={margin.left}
          scale={yScale}
          tickValues={yTicks}
          tickFormat={(value) => `${Number((value * 100).toPrecision(1))}%`}
          tickLabelProps={() => ({
            fontSize: 12,
            textAnchor: 'end',
            dx: '-0.5em',
            dy: '0.25em'
          })}
        />
      </svg>
    </div>
  );
};

export default CodfishGraph;
