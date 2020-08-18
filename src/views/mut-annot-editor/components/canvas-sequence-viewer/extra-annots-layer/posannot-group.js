import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect} from 'react-konva';

import {integersToRange} from '../funcs';

import {posByAnnotShape} from './prop-types';


const TOP = 1;
const BOTTOM = -1;


export default class PosAnnotGroup extends React.Component {

  static propTypes = {
    annotName: PropTypes.string.isRequired,
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
    let offsetY = topBottom === BOTTOM ? hoverFontSize / 2 : 0;
    offsetY += (
      annotIndex > 3 ? Math.floor(annotIndex / 2 - 2) * annotHeight : 0
    );
    const extraTick = annotIndex > 1 ? (
      annotHeight - tickLen - margin - offsetY
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
        getExtraAnnotColor,
        posRange2CoordPairs
      },
      annotName,
      annotIndex,
      positions: posByAnnot
    } = this.props;

    return <>
      {posByAnnot.map(({annotVal, positions}) => (
        integersToRange(positions).map(
          ([startPos, endPos], idx) => (
            posRange2CoordPairs(startPos, endPos, annotIndex).map(
              ({startCoord, endCoord}, jdx, arr) => (
                <Group
                 x={startCoord.x}
                 y={startCoord.y}
                 key={`${idx}-${jdx}`}>
                  <Rect
                   fill={getExtraAnnotColor(annotName)}
                   x={0}
                   y={0}
                   width={endCoord.x - startCoord.x}
                   height={endCoord.y - startCoord.y} />
                </Group>
              )
            )
          )
        )
      ))}
    </>;
  }
}


