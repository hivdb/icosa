import React from 'react';
import PropTypes from 'prop-types';

import {AxisBottom} from '@vx/axis';
import {Group} from '@vx/group';
import {scaleBand, scaleLinear} from '@vx/scale';
import {withTooltip, Tooltip} from '@vx/tooltip';
import range from 'd3-array/src/range';

import config from '../../../config';
import memoize from '../../../utils/memoize-decorator';

import style from './style.module.scss';

const MAX_PROTEIN_SIZE = config.maxProteinSize;
const margin = {top: 10, right: 10, bottom: 25, left: 10};

// temporary solution: can not use _colors.scss
const colors = {
  qaChartDR: '#1b8ecc', // blue,
  qaChartOther: '#1c1b1c', // thunder,
  qaChartProblem: '#e13333', // cinnabar,
  qaChartUnsequenced: '#bbbbbb', // silver,
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
};

function ticks(start, end, tick) {
  let step = parseInt((end + 1 - start) / (tick - 1), 10);
  step = parseInt((step + 3) / 5, 10) * 5;
  let r = [];
  const istart = parseInt(start / 5, 10) * 5;
  const maxI = end - (MAX_PROTEIN_SIZE / 80);
  for (let i = istart; i < maxI; i += step) {
    if (i > start) {
      r.push(i);
    }
  }
  return r;
}


class GeneChart extends React.Component {

  static propTypes = {
    firstAA: PropTypes.number.isRequired,
    lastAA: PropTypes.number.isRequired,
    gene: PropTypes.shape({
      name: PropTypes.string.isRequired,
      length: PropTypes.number.isRequired
    }).isRequired,
    mutations: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        position: PropTypes.number.isRequired,
        primaryType: PropTypes.string.isRequired,
        isApobecMutation: PropTypes.bool.isRequired,
        hasStop: PropTypes.bool.isRequired,
        isUnsequenced: PropTypes.bool.isRequired,
        isUnusual: PropTypes.bool.isRequired,
        isAmbiguous: PropTypes.bool.isRequired
      }).isRequired
    ).isRequired,
    frameShifts: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        position: PropTypes.number.isRequired,
        isInsertion: PropTypes.bool.isRequired,
        isDeletion: PropTypes.bool.isRequired
      }).isRequired
    ),
    containerWidth: PropTypes.number.isRequired,
    showTooltip: PropTypes.func,
    hideTooltip: PropTypes.func,
    tooltipOpen: PropTypes.bool,
    tooltipData: PropTypes.number,
    tooltipTop: PropTypes.number.isRequired,
    tooltipLeft: PropTypes.number.isRequired
  };

  __hash__() {
    return 'SequenceQAGeneChart';
  }

  get chartProps() {
    let {firstAA, lastAA} = this.props;
    const {gene, mutations, frameShifts, containerWidth} = this.props;
    let [aaStart, aaEnd] = [1, gene.length];
    let [posRight, posLeft] = [aaStart, aaEnd];
    firstAA = isNaN(firstAA) ? 1 : Math.max(1, firstAA);
    lastAA = isNaN(lastAA) ? aaEnd : Math.min(aaEnd, lastAA);

    let barData = {};
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
      let qaGroup = 'Other';
      if (mut.isDRM) {
        qaGroup = 'DR';
      }
      else if (mut.isUnsequenced) {
        qaGroup = 'Unsequenced';
      }
      else if (Object.keys(problemAttributes).some(attr => mut[attr])) {
        qaGroup = 'Problem';
      }

      const {y} = qaGroupAttributes[qaGroup];
      barData[qaGroup].push({x: pos, y});
      posRight = Math.max(pos, posRight);
      posLeft = Math.min(pos, posLeft);
    });

    if (posRight < posLeft) {
    // no mutation/frameshift is found, so just display a blank chart
      [posLeft, posRight] = [aaStart, aaEnd];
    }

    barData = Object.entries(barData)
      .map(([name, values]) => ({name, values}));

    let arr = [];
    for (var i in barData) {
      if (Object.prototype.hasOwnProperty.call(barData, i)) {
        const values = barData[i].values;
        const name = barData[i].name;
        for (var j in values){
          if (Object.prototype.hasOwnProperty.call(values, j)) {
            arr.push({x: values[j].x, y: values[j].y, name});
          }
        }
      }
    }

    const lenAA = lastAA - firstAA + 1;
    const scale = containerWidth / MAX_PROTEIN_SIZE / 1.5;

    // use ellipse formula to find a proper width:
    // y = (ymax * 2ax - (ax)^2)^0.5
    //
    // In witch:
    //
    // - y is the calculated graph width;
    // - x is the length of protein sequence;
    // - ymax is the max width (containerWidth);
    // - a is the scale of x: roughly xmax * a = ymax
    const width = Math.max(
      Math.sqrt(
        2 * (containerWidth - margin.left) * scale * lenAA -
        Math.pow(scale * lenAA, 2)
      ),
      400
    );

    // roughly tick every 50px
    let xAxisTickValues = ticks(firstAA, lastAA, parseInt(width / 50, 10));
    xAxisTickValues.push(firstAA);
    xAxisTickValues.push(lastAA);

    return {
      containerWidth,
      width,
      data: arr,
      firstAA,
      lastAA,
      xAxisTickValues
    };
  }

  getMutationByPos = memoize((mutations) => {
    return mutations
      .reduce((map, mut) => {
        const pos = mut.position;
        map.set(pos, mut);
        return map;
      }, new Map());
  });

  getFrameShiftByPos = memoize((frameShifts) => {
    return frameShifts
      .reduce((map, sft) => {
        const pos = sft.position;
        map.set(pos, sft);
        return map;
      }, new Map());
  });

  findAtPos(pos) {
    const {mutations, frameShifts} = this.props;
    return [
      this.getMutationByPos(mutations).get(pos),
      this.getFrameShiftByPos(frameShifts).get(pos)
    ];
  }

  tooltipFormat = (xValue) => {
    const [mut, sft] = this.findAtPos(xValue);
    let problems = [];
    if (mut && mut.isDRM) {
      // the one at the position is a DRM
      problems.push(<div key={mut.text}>{mut.text}</div>);
    }
    else if (mut) {
      // the one at the position is a problem mutation
      for (let [attr, label] of Object.entries(problemAttributes)) {
        if (mut[attr]) {
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
      // the one at the position is a frameshift
      problems.push(
        <div key={`fs${sft.position}`}>
          <strong className={style['tooltip-label']}>
            Frameshift {sft.isInsertion ? "Insertion" : "Deletion"}:&nbsp;
          </strong>
          {sft.text}
        </div>
      );
    }
    return <div>{problems}</div>;
  };

  showTooltipIf = (yValue) => {
    // only shows DR and Problem
    return yValue > qaGroupAttributes.Other.y;
  };

  render() {
    const {
      showTooltip,
      hideTooltip,
      tooltipOpen,
      tooltipData,
      tooltipTop,
      tooltipLeft
    } = this.props;

    const {props: {gene}, chartProps} = this;
    const data = chartProps.data;

    const xfunc = d => d.x;
    const yfunc = d => d.y;

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

    const compose = (scale, accessor) => (data) => scale(accessor(data));
    const xPoint = compose(xScale, xfunc);
    const yPoint = compose(yScale, yfunc);

    return <section>
      <h3>{gene.name}</h3>
      <svg width={width} height={height + margin.top + margin.bottom}>
        <Group top={margin.top} left={margin.left}>
          {data.map((d, i) => {
            const barHeight = yMax - yPoint(d);
            return (
              <rect
               key={`bar-${i}`}
               x = {xPoint(d)}
               y = {yMax - barHeight}
               fill={qaGroupAttributes[d.name].color}
               width={barwidth}
               height={barHeight}
               onMouseMove={() => {
                 const top = yMax - barHeight;
                 const left = xPoint(d);
                 const xValue = d.x;
                 if (this.showTooltipIf(d.y)){
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
          {this.tooltipFormat(tooltipData)}
        </Tooltip>
      )}

    </section>;
  }
}

export default withTooltip(GeneChart);
