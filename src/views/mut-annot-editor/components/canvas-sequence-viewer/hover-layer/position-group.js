import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {Group, Rect, Text} from 'react-konva';


export default class PositionGroup extends React.Component {

  static propTypes = {
    position: PropTypes.number.isRequired,
    config: PropTypes.object.isRequired
  }

  constructor() {
    super(...arguments);
    this.posNumTextRef = createRef();
  }

  get posNumOffset() {
    const {
      config: {
        posItemSizePixel,
        hoverPosNumOffsetPixel
      }
    } = this.props;
    const {current} = this.posNumTextRef;
    let addOffsetX = 0;
    if (current) {
      addOffsetX = (posItemSizePixel - current.getWidth()) / 2;
    }
    return {
      x: hoverPosNumOffsetPixel.x + addOffsetX,
      y: hoverPosNumOffsetPixel.y
    };
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const {
      position,
      config: {
        posItemSizePixel,
        strokeWidthPixel,
        hoverPosNumFontSizePixel,
        hoverPosNumColor,
        fontFamily,
        pos2Coord,
        getStrokeColor
      }
    } = this.props;
    const {posNumOffset} = this;
    const {current: textElem} = this.posNumTextRef;
    let textColor = hoverPosNumColor;
    if (!textElem || textElem.attrs['data-position'] !== position) {
      this._timeout = setTimeout(() => {
        this.forceUpdate();
        delete this._timeout;
      }, 0);
      textColor = 'transparent';
    }

    // change stroke color of rect
    return (
      <Group {...pos2Coord(position)}>
        <Rect
         x={0}
         y={0}
         width={posItemSizePixel}
         height={posItemSizePixel}
         stroke={getStrokeColor(position, true)}
         strokeWidth={strokeWidthPixel} />
        <Rect
         x={0}
         y={posNumOffset.y}
         fill="white"
         opacity={0.5}
         width={posItemSizePixel}
         height={hoverPosNumFontSizePixel} />
        <Text
         ref={this.posNumTextRef}
         x={posNumOffset.x}
         y={posNumOffset.y}
         data-position={position}
         fontSize={hoverPosNumFontSizePixel}
         fontFamily={fontFamily}
         fill={textColor}
         align="center"
         text={position} />
      </Group>
    );
  }
}
