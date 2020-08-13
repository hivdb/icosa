import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {Layer, Group, Path, Text} from 'react-konva';

import {integersToRange} from '../funcs';
import {annotShape} from '../../../prop-types';

const posByAnnotShape = (
  PropTypes.shape({
    annotVal: PropTypes.string.isRequired,
    positions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired
  })
);

const TOP = 1;
const BOTTOM = -1;


class XEndText extends React.Component {

  constructor() {
    super(...arguments);
    this.textRef = createRef();
  }

  get textWidth() {
    if (this.textRef.current) {
      return this.textRef.current.width();
    }
    return 0;
  }

  render() {
    const {xEnd, ...props} = this.props;
    if (!this.textRef.current) {
      setTimeout(() => this.forceUpdate(), 0);
    }

    return (
      <Text
       {...props}
       ref={this.textRef}
       x={xEnd - this.textWidth} />
    );
  }
}


class PosAnnotGroup extends React.Component {
  static propTypes = {
    opacity: PropTypes.number.isRequired,
    annotIndex: PropTypes.number.isRequired,
    numAnnots: PropTypes.number.isRequired,
    config: PropTypes.object.isRequired,
    positions: PropTypes.arrayOf(
      posByAnnotShape.isRequired
    ).isRequired
  }

  get topBottom() {
    // 1: top, -1: bottom
    return this.props.annotIndex % 2 === 1 ? TOP : BOTTOM;
  }

  calcPath = (startCoord, endCoord, isStart, isEnd) => {
    const {
      config: {
        annotMarginPixel: margin,
        annotTickLengthPixel: tickLen,
        extraAnnotHeightPixel: annotHeight,
        hoverPosNumFontSizePixel: hoverFontSize
      },
      annotIndex
    } = this.props;
    const {topBottom} = this;
    const offsetY = topBottom === BOTTOM ? hoverFontSize / 2 : 0;
    const extraTick = annotIndex > 1 ? (
      Math.floor(annotIndex / 2) * annotHeight - tickLen - margin - offsetY
    ) : 0;
    let annotLineLen = endCoord.x - startCoord.x;
    if (!isStart) {
      annotLineLen -= tickLen;
    }
    let extStartPath = null;
    let extEndPath = null;
    const path = [];
    if (isStart) {
      path.push(`m0,${topBottom * (extraTick - margin)}`);
      path.push(`v${topBottom * (- tickLen - offsetY - extraTick)}`);
    }
    else {
      path.push(`m${tickLen},${topBottom * (- margin - tickLen - offsetY)}`);
      extStartPath = (
        `m0,${topBottom * (- margin - offsetY - tickLen / 2)}` +
        `l${tickLen},${- topBottom * tickLen / 2}` +
        `l${- tickLen},${- topBottom * tickLen / 2}`
      );
    }
    path.push(`h${annotLineLen}`);
    if (isEnd) {
      path.push(`v${topBottom * (tickLen + offsetY + extraTick)}`);
    }
    else {
      extEndPath = (
        `m${endCoord.x - startCoord.x - tickLen},` +
        `${topBottom * (- margin - offsetY - tickLen / 2)}` +
        `l${tickLen},${- topBottom * tickLen / 2}` +
        `l${- tickLen},${- topBottom * tickLen / 2}`
      );
    }
    return [path.join(' '), extStartPath, extEndPath];
  }

  render() {
    const {
      config: {
        annotStrokeWidthPixel: strokeWidth,
        annotStrokeColor: strokeColor,
        annotValFontSizePixel: fontSize,
        hoverPosNumFontSizePixel: hoverFontSize,
        annotValOffsetPixel,
        annotValBottomOffsetPixel,
        annotValTextColor: textColor,
        posItemSizePixel: boxSize,
        posItemOuterWidthPixel: boxOuterWidth,
        extraAnnotHeightPixel,
        fontFamily,
        posRange2CoordPairs
      },
      annotIndex,
      numAnnots,
      opacity,
      positions: posByAnnot
    } = this.props;
    const {topBottom} = this;
    const annotOffsetY = (
      (topBottom === BOTTOM ? boxSize : 0) -
      topBottom * Math.floor(annotIndex / 2) * extraAnnotHeightPixel
    );
    const textOffset = (
      topBottom === TOP ? annotValOffsetPixel : annotValBottomOffsetPixel
    );
    const extraTextOffsetY = topBottom === BOTTOM ? hoverFontSize / 2 : 0;

    return <>
      {posByAnnot.map(({annotVal, positions}) => (
        integersToRange(positions).map(
          ([startPos, endPos], idx) => (
            posRange2CoordPairs(startPos, endPos, numAnnots - annotIndex).map(
              ({startCoord, endCoord}, jdx, arr) => {
                const isStart = jdx === 0;
                const isEnd = jdx + 1 === arr.length;
                const [path, extStartPath, extEndPath] = this.calcPath(
                  startCoord, endCoord, isStart, isEnd
                );
                const showEndText = (
                  isEnd && endCoord.x - startCoord.x > boxOuterWidth * 5
                );
                return <Group
                 x={startCoord.x}
                 y={startCoord.y + annotOffsetY}
                 opacity={opacity}
                 key={`${idx}-${jdx}`}>
                  <Text
                   x={textOffset.x}
                   y={textOffset.y + extraTextOffsetY}
                   fontSize={fontSize}
                   fontFamily={fontFamily}
                   fontStyle={
                     isStart || endCoord.x - startCoord.x < boxOuterWidth ?
                     "bold" : "italic"
                   }
                   fill={textColor}
                   text={annotVal} />
                  {showEndText &&
                    <XEndText
                     xEnd={endCoord.x - startCoord.x - textOffset.x}
                     y={textOffset.y + extraTextOffsetY}
                     fontSize={fontSize}
                     fontFamily={fontFamily}
                     fontStyle="bold"
                     fill={textColor}
                     text={annotVal} />}
                  <Path
                   stroke={strokeColor}
                   strokeWidth={strokeWidth}
                   data={path} />
                  {extStartPath &&
                    <Path
                     stroke={strokeColor}
                     strokeWidth={strokeWidth}
                     data={extStartPath} />}
                  {extEndPath &&
                    <Path
                     stroke={strokeColor}
                     strokeWidth={strokeWidth}
                     data={extEndPath} />}
                </Group>;
              }
            )
          )
        )
      ))}
    </>;
  }
}


export default class AnnotLayer extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    positionsByAnnot: PropTypes.arrayOf(
      PropTypes.shape({
        annot: annotShape.isRequired,
        positions: PropTypes.arrayOf(posByAnnotShape.isRequired),
        aminoAcids: PropTypes.arrayOf(
          PropTypes.shape({
            position: PropTypes.number.isRequired,
            aminoAcids: PropTypes.arrayOf(
              PropTypes.string.isRequired
            ).isRequired
          }).isRequired
        )
      })
    )
  }

  render() {
    const {config, positionsByAnnot} = this.props;
    const reversed = [...positionsByAnnot].reverse();
    const lastIdx = reversed.length - 1;
    const opDelim = Math.floor(reversed.length / 2) - 1;

    return (
      <Layer>
        {reversed.map(({
          annot: {level}, positions
        }, idx) => (level === 'position' ?
          <PosAnnotGroup
           key={idx}
           numAnnots={lastIdx + 1}
           annotIndex={idx}
           opacity={
             opDelim === 0 ? 1 : 1 - 0.6 * Math.floor(idx / 2) / opDelim
           }
           {...{config, positions}} />
          : null
        ))}
      </Layer>
    );


  }

}
