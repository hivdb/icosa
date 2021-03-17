import React from 'react';
import PropTypes from 'prop-types';
import {Group, Rect} from 'react-konva';


export default class PosAnnotGroup extends React.Component {

  static propTypes = {
    hoverUSAnnot: PropTypes.shape({
      annotName: PropTypes.string
    }).isRequired,
    config: PropTypes.object.isRequired
  }

  render() {
    const {
      hoverUSAnnot: {
        annotName: hoverAnnotName
      },
      config: {
        getUnderscoreAnnotColor,
        posRange2CoordPairs,
        underscoreAnnotLocations: {locations: annotLocs}
      }
    } = this.props;

    return <Group>
      {annotLocs.map(({
        posStart, posEnd, locIndex,
        annotName
      }, idx) => {
        let opacity = 1;
        if (hoverAnnotName && hoverAnnotName !== annotName) {
          opacity = .2;
        }
        return posRange2CoordPairs(posStart, posEnd, locIndex).map(
          ({startCoord, endCoord}, jdx) => (
            <Rect
             key={`${idx}-${jdx}`}
             x={startCoord.x}
             y={startCoord.y}
             opacity={opacity}
             fill={getUnderscoreAnnotColor(annotName)}
             width={endCoord.x - startCoord.x}
             height={endCoord.y - startCoord.y} />
          )
        );
      })}
    </Group>;
  }
}


