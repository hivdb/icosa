import React from 'react';
import PropTypes from 'prop-types';
import range from 'lodash/range';
import {Group, Rect, Text} from 'react-konva';


export default class PosAnnotGroup extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired
  }

  render() {
    const {
      config: {
        getExtraAnnotColor,
        posRange2CoordPairs,
        extraAnnotLocations: {locations: annotLocs},
        extraAnnotDotFontSizePixel,
        fontFamily
      }
    } = this.props;

    return <Group>
      {annotLocs.map(({
        startPos, endPos, locIndex,
        annotName, annotLevel
      }, idx) => {
        if (annotLevel === 'position') {
          return posRange2CoordPairs(startPos, endPos, locIndex).map(
            ({startCoord, endCoord}, jdx) => (
              <Rect
               key={`${idx}-${jdx}`}
               x={startCoord.x}
               y={startCoord.y}
               fill={getExtraAnnotColor(annotName)}
               width={endCoord.x - startCoord.x}
               height={endCoord.y - startCoord.y} />
            )
          );
        }
        else {
          return range(startPos, endPos + 1).map(pos => (
            posRange2CoordPairs(pos, pos, locIndex).map(
              ({startCoord, endCoord}, jdx) => (
                <Text
                 key={`${idx}-${pos}-${jdx}`}
                 x={startCoord.x}
                 y={startCoord.y - extraAnnotDotFontSizePixel / 4}
                 text={'\u25cf'}
                 align="center"
                 fontSize={extraAnnotDotFontSizePixel}
                 fontFamily={fontFamily}
                 fill={getExtraAnnotColor(annotName)}
                 width={endCoord.x - startCoord.x}
                 height={endCoord.y - startCoord.y} />
              )
            )
          ));
        }
      })}
    </Group>;
  }
}


