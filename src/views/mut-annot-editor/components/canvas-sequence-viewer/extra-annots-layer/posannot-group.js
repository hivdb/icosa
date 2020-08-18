import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect} from 'react-konva';


export default class PosAnnotGroup extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired
  }

  render() {
    const {
      config: {
        getExtraAnnotColor,
        posRange2CoordPairs,
        extraAnnotLocations: {locations: annotLocs}
      }
    } = this.props;

    return <Group>
      {annotLocs.map(({startPos, endPos, locIndex, annotName}, idx) => (
        posRange2CoordPairs(startPos, endPos, locIndex).map(
          ({startCoord, endCoord}, jdx) => (
            <Rect
             key={`${idx}-${jdx}`}
             x={startCoord.x}
             y={startCoord.y}
             fill={getExtraAnnotColor(annotName)}
             width={endCoord.x - startCoord.x}
             height={endCoord.y - startCoord.y} />
          )
        )
      ))}
    </Group>;
  }
}


