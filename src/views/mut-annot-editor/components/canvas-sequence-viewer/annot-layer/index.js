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
    config: PropTypes.object.isRequired,
    positions: PropTypes.arrayOf(
      posByAnnotShape.isRequired
    ).isRequired
  }

  calcPath = (startCoord, endCoord, isStart, isEnd) => {
    const {
      config: {
        annotMarginPixel: margin,
        annotTickLengthPixel: tickLen,
      },
    } = this.props;
    let annotLineLen = endCoord.x - startCoord.x;
    if (!isStart) {
      annotLineLen -= tickLen;
    }
    let extStartPath = null;
    let extEndPath = null;
    const path = [];
    if (isStart) {
      path.push(`m0,-${margin} v-${tickLen}`);
    }
    else {
      path.push(`m${tickLen},-${margin + tickLen}`);
      extStartPath = (
        `m0,-${margin + tickLen / 2}` +
        `l${tickLen},-${tickLen / 2}` +
        `l-${tickLen},-${tickLen / 2}`
      );
    }
    path.push(`h${annotLineLen}`);
    if (isEnd) {
      path.push(`v${tickLen}`);
    }
    else {
      extEndPath = (
        `m${endCoord.x - startCoord.x - tickLen},-${margin + tickLen / 2}` +
        `l${tickLen},-${tickLen / 2}` +
        `l-${tickLen},-${tickLen / 2}`
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
        annotValOffsetPixel: textOffset,
        annotValTextColor: textColor,
        posItemOuterWidthPixel: boxOuterWidth,
        fontFamily,
        posRange2CoordPairs
      },
      positions: posByAnnot
    } = this.props;

    return <>
      {posByAnnot.map(({annotVal, positions}) => (
        integersToRange(positions).map(
          ([startPos, endPos], idx) => (
            posRange2CoordPairs(startPos, endPos).map(
              ({startCoord, endCoord}, jdx, arr) => {
                const isStart = jdx === 0;
                const isEnd = jdx + 1 === arr.length;
                const [path, extStartPath, extEndPath] = this.calcPath(
                  startCoord, endCoord, isStart, isEnd
                );
                const showEndText = (
                  isEnd && endCoord.x - startCoord.x > boxOuterWidth * 5
                );
                return <Group {...startCoord} key={`${idx}-${jdx}`}>
                  <Text
                   {...textOffset}
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
                     y={textOffset.y}
                     xEnd={endCoord.x - startCoord.x - textOffset.x}
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

    return (
      <Layer>
        {positionsByAnnot.map(({
          annot: {level}, positions
        }, idx) => (level === 'position' ?
          <PosAnnotGroup key={idx} {...{config, positions}} /> : null
        ))}
      </Layer>
    );


  }

}
