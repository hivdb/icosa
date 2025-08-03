import React from 'react';
import {AxisBottom} from '@vx/axis';
import {Group} from '@vx/group';
import {scaleBand, scaleLinear} from '@vx/scale';
import {withTooltip, Tooltip, TooltipWithBoundsProps} from '@vx/tooltip';
import {range} from 'd3-array';

import config from '../../../config';

import style from './style.module.scss';

const MAX_PROTEIN_SIZE = (config as any).maxProteinSize as number;
const margin = {top: 10, right: 10, bottom: 25, left: 10};

// temporary solution: can not use _colors.scss
const colors = {
  qaChartDR: '#1b8ecc', // blue
  qaChartOther: '#1c1b1c', // thunder
  qaChartProblem: '#e13333', // cinnabar
  qaChartUnsequenced: '#bbbbbb', // silver
  dividingLine: '#969696' // dustygray
};

const problemAttributes = {
  isUnsequenced: 'Unsequenced region',
  isApobecMutation: 'Apobec Mutation',
  hasStop: 'Stop Codon',
  isUnusual: 'Unusual Mutation',
  isAmbiguous: 'Ambiguous Mutation'
};

const qaGroupAttributes = {
  DR: {y: 60, color: colors.qaChartDR},
  Other: {y: 30, color: colors.qaChartOther},
  Problem: {y: 80, color: colors.qaChartProblem},
  Unsequenced: {y: 80, color: colors.qaChartUnsequenced}
} as const;

/**
 * Generate evenly spaced tick values between two amino acid positions.
 *
 * @param start - Starting amino acid position.
 * @param end - Ending amino acid position.
 * @param tick - Desired number of ticks.
 * @returns Array of tick positions.
 */
function ticks(start: number, end: number, tick: number): number[] {
  let step = parseInt((end + 1 - start) / (tick - 1), 10);
  step = parseInt((step + 3) / 5, 10) * 5;
  const r: number[] = [];
  const istart = parseInt(start / 5, 10) * 5;
  const maxI = end - MAX_PROTEIN_SIZE / 80;
  for (let i = istart; i < maxI; i += step) {
    if (i > start) {
      r.push(i);
    }
  }
  return r;
}

export interface Mutation {
  text: string;
  position: number;
  primaryType: string;
  isApobecMutation: boolean;
  hasStop: boolean;
  isUnsequenced: boolean;
  isUnusual: boolean;
  isAmbiguous: boolean;
  isDRM?: boolean;
}

export interface FrameShift {
  text: string;
  position: number;
  isInsertion: boolean;
  isDeletion: boolean;
}

export interface Gene {
  name: string;
  length: number;
}

export interface GeneChartProps {
  firstAA: number;
  lastAA: number;
  gene: Gene;
  mutations: Mutation[];
  frameShifts?: FrameShift[];
  containerWidth: number;
  showTooltip?: TooltipWithBoundsProps['showTooltip'];
  hideTooltip?: () => void;
  tooltipOpen?: boolean;
  tooltipData?: number;
  tooltipTop?: number;
  tooltipLeft?: number;
}

/**
 * Render a bar chart summarising sequence quality annotations for a gene.
 *
 * @param props - Component properties describing gene and mutation data.
 * @returns SVG chart illustrating mutation categories across the gene.
 */
export function GeneChart({
  firstAA,
  lastAA,
  gene,
  mutations,
  frameShifts = [],
  containerWidth,
  showTooltip = () => undefined,
  hideTooltip = () => undefined,
  tooltipOpen = false,
  tooltipData,
  tooltipTop = 0,
  tooltipLeft = 0
}: GeneChartProps) {
  const chartProps = React.useMemo(() => {
    let fAA = isNaN(firstAA) ? 1 : Math.max(1, firstAA);
    let lAA = isNaN(lastAA) ? gene.length : Math.min(gene.length, lastAA);
    let posRight = 1;
    let posLeft = gene.length;
    const barData: Record<string, Array<{x: number; y: number}>> = {};
    for (const qaGroup in qaGroupAttributes) {
      barData[qaGroup] = [];
    }

    frameShifts.forEach(sft => {
      const pos = sft.position;
      const qaGroup = 'Problem';
      const {y} = qaGroupAttributes[qaGroup];
      barData[qaGroup].push({x: pos, y});
      posRight = Math.max(pos, posRight);
      posLeft = Math.min(pos, posLeft);
    });

    mutations.forEach(mut => {
      const pos = mut.position;
      let qaGroup: keyof typeof qaGroupAttributes = 'Other';
      if (mut.isDRM) {
        qaGroup = 'DR';
      } else if (mut.isUnsequenced) {
        qaGroup = 'Unsequenced';
      } else if (Object.keys(problemAttributes).some(attr => (mut as any)[attr])) {
        qaGroup = 'Problem';
      }
      const {y} = qaGroupAttributes[qaGroup];
      barData[qaGroup].push({x: pos, y});
      posRight = Math.max(pos, posRight);
      posLeft = Math.min(pos, posLeft);
    });

    if (posRight < posLeft) {
      // no mutation/frameshift is found, so just display a blank chart
      [posLeft, posRight] = [1, gene.length];
    }

    const arr: Array<{x: number; y: number; name: string}> = [];
    for (const [name, values] of Object.entries(barData)) {
      for (const v of values) {
        arr.push({x: v.x, y: v.y, name});
      }
    }

    const lenAA = lAA - fAA + 1;
    const scale = containerWidth / MAX_PROTEIN_SIZE / 1.5;

    // use ellipse formula to find a proper width:
    // y = (ymax * 2ax - (ax)^2)^0.5
    const width = Math.max(
      Math.sqrt(
        2 * (containerWidth - margin.left) * scale * lenAA -
        Math.pow(scale * lenAA, 2)
      ),
      400
    );

    // roughly tick every 50px
    const xAxisTickValues = ticks(fAA, lAA, parseInt(width / 50, 10));
    xAxisTickValues.push(fAA);
    xAxisTickValues.push(lAA);

    return {
      containerWidth,
      width,
      data: arr,
      firstAA: fAA,
      lastAA: lAA,
      xAxisTickValues
    };
  }, [firstAA, lastAA, gene, mutations, frameShifts, containerWidth]);

  const mutationByPos = React.useMemo(() => {
    return mutations.reduce((map, mut) => {
      map.set(mut.position, mut);
      return map;
    }, new Map<number, Mutation>());
  }, [mutations]);

  const frameShiftByPos = React.useMemo(() => {
    return frameShifts.reduce((map, sft) => {
      map.set(sft.position, sft);
      return map;
    }, new Map<number, FrameShift>());
  }, [frameShifts]);

  const findAtPos = React.useCallback(
    (pos: number) => [mutationByPos.get(pos), frameShiftByPos.get(pos)] as const,
    [mutationByPos, frameShiftByPos]
  );

  const tooltipFormat = React.useCallback(
    (xValue: number) => {
      const [mut, sft] = findAtPos(xValue);
      const problems: React.ReactNode[] = [];
      if (mut && mut.isDRM) {
        problems.push(<div key={mut.text}>{mut.text}</div>);
      } else if (mut) {
        for (const [attr, label] of Object.entries(problemAttributes)) {
          if ((mut as any)[attr]) {
            problems.push(
              <div key={mut.text}>
                <strong className={style['tooltip-label']}>{label}: </strong>
                {mut.text}
              </div>
            );
            break;
          }
        }
      }
      if (sft) {
        problems.push(
          <div key={`fs${sft.position}`}>
            <strong className={style['tooltip-label']}>
              Frameshift {sft.isInsertion ? 'Insertion' : 'Deletion'}:&nbsp;
            </strong>
            {sft.text}
          </div>
        );
      }
      return <div>{problems}</div>;
    },
    [findAtPos]
  );

  const showTooltipIf = React.useCallback(
    (yValue: number) => yValue > qaGroupAttributes.Other.y,
    []
  );

  const {data} = chartProps;
  const xfunc = (d: {x: number}) => d.x;
  const yfunc = (d: {y: number}) => d.y;
  const width = chartProps.containerWidth;
  const height = 65;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    range: [chartProps.firstAA, chartProps.width],
    domain: [chartProps.firstAA, chartProps.lastAA]
  });
  const xScaleband = scaleBand({
    range: [chartProps.firstAA, chartProps.width],
    domain: range(chartProps.firstAA, chartProps.lastAA + 1),
    padding: 0.15
  });
  const yScale = scaleLinear({
    range: [yMax, 0],
    domain: [0, 80]
  });

  const barwidth = xScaleband.bandwidth();
  const compose = (scale: any, accessor: any) => (data: any) => scale(accessor(data));
  const xPoint = compose(xScale, xfunc);
  const yPoint = compose(yScale, yfunc);

  return (
    <section>
      <h3>{gene.name}</h3>
      <svg width={width} height={height + margin.top + margin.bottom}>
        <Group top={margin.top} left={margin.left}>
          {data.map((d, i) => {
            const barHeight = yMax - yPoint(d);
            return (
              <rect
                key={`bar-${i}`}
                x={xPoint(d)}
                y={yMax - barHeight}
                fill={qaGroupAttributes[d.name as keyof typeof qaGroupAttributes].color}
                width={barwidth}
                height={barHeight}
                onMouseMove={() => {
                  const top = yMax - barHeight;
                  const left = xPoint(d);
                  const xValue = d.x;
                  if (showTooltipIf(d.y)) {
                    showTooltip({
                      tooltipData: xValue,
                      tooltipTop: top,
                      tooltipLeft: left
                    });
                  }
                }}
                onMouseLeave={() => hideTooltip()}
              />
            );
          })}
        </Group>

        <AxisBottom
          top={yMax + margin.top}
          left={barwidth / 2 + margin.left}
          scale={xScale}
          stroke={colors.dividingLine}
          tickValues={chartProps.xAxisTickValues}
          tickLabelProps={() => ({
            dy: '0.25em',
            textAnchor: 'middle',
            fill: 'black'
          })}
        />
      </svg>

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
          {tooltipFormat(tooltipData as number)}
        </Tooltip>
      )}
    </section>
  );
}

export default withTooltip(GeneChart);
