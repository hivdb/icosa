import React from 'react';
import PropTypes from 'prop-types';

import {AxisBottom, AxisLeft} from '@vx/axis';
import {Group} from '@vx/group';
import {Line} from '@vx/shape';
import {scaleBand, scaleLinear} from '@vx/scale';
import {withTooltip, Tooltip} from '@vx/tooltip';
import range from 'd3-array/src/range';
import {FaAngleDoubleRight} from '@react-icons/all-files/fa/FaAngleDoubleRight';

import config from '../../../config.js';

import {genesPropType, codonReadsCoveragePropType} from './prop-types';
import style from './style.module.scss';

const colors = {
  stroke: '#ffffff',  // white,
  fill: '#24b298',  // jungleGreen,
  fillTrimmed: '#bbbbbb',  // silver
  dashedDividingLine: '#1c1b1c'  // thunder
};

const margin = { top: 10, right: 0, bottom: 40, left: 40 };
const height = 420;

function ticks(start, end, tick) {
  let step = parseInt((end + 1 - start) / (tick - 1), 10);
  step = parseInt((step + 3) / 5, 10) * 5;
  let r = [];
  const istart = parseInt(start / 5, 10) * 5;
  for (let i=istart; i < end - 7; i += step) {
    if (i > start) {
      r.push(i);
    }
  }
  return r;
}


class CodonCoverageGraph extends React.Component {

  static propTypes = {
    genes: genesPropType,
    codonReadsCoverage: codonReadsCoveragePropType,
    containerWidth: PropTypes.number.isRequired,
    minReadDepth: PropTypes.number.isRequired
  }

  static defaultProps = {
    output: 'default'
  }

  constructor() {
    super(...arguments);
    this.mainGRef = React.createRef();
  }

  get graphProps(){
    let {
      genes,
      codonReadsCoverage,
      containerWidth
    } = this.props;

    let yMax = 0;
    codonReadsCoverage = codonReadsCoverage.reduce(
      (acc, {gene: {name: gene}, position, ...value}) => {
        acc[`${gene}:${position}`] = value;
        return acc;
      }, {});

    const barData = [];
    let geneOffset = 0;
    const xAxisTickValues = [];
    for (const {name: gene, length} of genes) {
      for (let pos = 1; pos <= length; pos ++) {
        const genePos = `${gene}:${pos}`;
        let genePosValue;
        if (genePos in codonReadsCoverage) {
          genePosValue = codonReadsCoverage[genePos];
        }
        else {
          genePosValue = {
            totalReads: 0,
            isTrimmed: false
          };
        }
        const {totalReads, isTrimmed} = genePosValue;
        if (yMax < totalReads){
          yMax = totalReads;
        }
        barData.push({
          x: geneOffset + pos, y: totalReads,
          position: genePos, totalReads,
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
      Math.sqrt(2 * (containerWidth-margin.left-margin.right) * scale * lenAA
              - Math.pow(scale * lenAA, 2)), 400);

    xAxisTickValues.push(geneOffset);
    
    let yAxisTickValues = ticks(0, yMax, parseInt(height / 20, 10));
    yAxisTickValues.push(0);

    // console.log(barData);
    return{
      data: barData,
      firstPos: 1,
      lastPos: geneOffset,
      width,
      yMax,
      xAxisTickValues,
      yAxisTickValues
    };
  }

  get genePosRanges() {
    const {genes} = this.props;
    const range = [];
    let geneOffset = 1;
    for (const {name: gene, length} of genes) {
      range.push([gene, geneOffset, geneOffset + length]);
      geneOffset += length;
    }
    return range;
  }

  render() {
    const {
      containerWidth,
      showTooltip,
      hideTooltip,
      tooltipOpen,
      tooltipData,
      tooltipTop,
      tooltipLeft,
      minReadDepth
    } = this.props;
    const {graphProps, genePosRanges} = this;
    const {
      firstPos, lastPos, data,
      xAxisTickValues,
      yAxisTickValues
    } = graphProps;

    const width = containerWidth;
    const yMax = height - margin.top - margin.bottom;
      
    const xfunc = d => d.x;
    const yfunc = d => d.y;

    const xScale = scaleLinear({
      range: [firstPos, graphProps.width],
      domain: [firstPos, lastPos],
    });
    const xScaleBandDomain = [];
    for (let i=firstPos; i <= lastPos; i++) {
      xScaleBandDomain.push(i);
    }
    const xScaleband = scaleBand({
      range: [firstPos, graphProps.width],
      domain: range(firstPos, lastPos + 1),
      padding: 0
    });
    const yScale = scaleLinear({
      range: [yMax, 0],
      domain: [0, graphProps.yMax],
    });
      
      
    const compose = (scale, accessor) => (data) => scale(accessor(data));
    const xPoint = compose(xScale, xfunc);
    const yPoint = compose(yScale, yfunc);
    
    const barWidth = xScaleband.bandwidth();
    const yCutoff = yScale(minReadDepth);

    return <>
      <div className={style.instruction}>
        Scroll right for more <FaAngleDoubleRight />
      </div>
      <svg
       className={style['left-axis']}
       width={margin.left + 1}
       height={height + margin.top + margin.bottom}>
        <AxisLeft
         scale={yScale}
         top={margin.top}
         left={margin.left}
         stroke={colors.dividingLine}
         tickStroke={colors.dividingLine}
         tickValues={yAxisTickValues}
         tickLabelProps={(val, i) => ({
           dx: '-0.2em',
           dy: '0.3em',
           textAnchor: 'end',
           fontSize: 9,
           fill: 'black',
         })}
        />
      </svg>
      <div
       ref={this.mainGRef}
       className={style['main-graph-container']}>
        <svg
         width={width}
         height={height + margin.top + margin.bottom}>
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
                 fill={config.seqReadsCodonCovBgColors[gene]} key={idx} />
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
                 strokeDasharray={
                   `0 ${barWidth} ${barHeight} ${barWidth} ${barHeight}`
                 }
                 strokeWidth="0.01%"
                 width={barWidth}
                 height={barHeight}
                 onMouseMove={event => {
                   // const top = yMax - barHeight;
                   // const left = xPoint(d);
                   const container = this.mainGRef.current.parentElement;
                   const left = event.pageX - container.offsetLeft + 15;
                   const top = event.pageY - container.offsetTop - 5;
                   const {position, totalReads} = d;
                   showTooltip({
                     tooltipData: {position, totalReads},
                     tooltipTop: top,
                     tooltipLeft: left
                   });
                 }}
                 onMouseLeave={event => hideTooltip()}
               />
              );
            })}
            {genePosRanges.map(([,value], idx) => {
              if (value === 1) {
                return null;
              }
              const x = xScale(value);
              return (
                <Line
                 strokeDasharray="3,3"
                 from={{x, y: 0}} to={{x, y: yMax}}
                 strokeWidth={1} key={idx}
                 stroke={colors.dashedDividingLine} />
              );
            })}
            <Line
             strokeDasharray="5,5"
             from={{x: 0, y: yCutoff}}
             to={{x: xScale(lastPos), y: yCutoff}}
             strokeWidth={1} stroke={colors.dashedDividingLine} />
          </Group>

          <AxisBottom
           top={yMax + margin.top}
           left={barWidth / 2}
           scale={xScale}
           stroke={colors.dividingLine}
           tickStroke={colors.dividingLine}
           tickValues={xAxisTickValues}
           tickFormat={pos => {
             for (const [gene, start, end] of genePosRanges) {
               if (pos >= start && pos < end) {
                 const relPos = pos - start + 1;
                 return `${gene}:${relPos}`;
               }
             }
           }}
           tickLabelProps={(val, i) => ({
             fontSize: 11,
             textAnchor: 'start',
             transform: `rotate(90 ${xScale(val) + barWidth / 2} 15.5)`
           })}
          />
        </svg>
      </div>
      <div className={style.footnote}>
        Horizontal dashed line: minimal read depth;
        Vertical dashed lines: borders of different genes.
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
         }}>
          Codon Position {tooltipData.position}{' '}
          (n={tooltipData.totalReads.toLocaleString()})
        </Tooltip>
      )}
    </>;
  }
}

export default withTooltip(CodonCoverageGraph);
