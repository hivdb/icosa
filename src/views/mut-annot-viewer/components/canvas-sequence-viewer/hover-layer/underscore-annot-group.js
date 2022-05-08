import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import {Group, Text} from 'react-konva';


export default class UnderscoreAnnotGroup extends React.Component {

  static propTypes = {
    annotName: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    config: PropTypes.object.isRequired
  };

  constructor() {
    super(...arguments);
    this.textRef = createRef();
  }

  get textOffset() {
    const {
      x,
      config: {
        canvasWidthPixel,
        posItemSizePixel,
        hoverUnderscoreAnnotOffsetPixel
      }
    } = this.props;
    const {current} = this.textRef;
    const currentWidth = current ? current.getWidth() : posItemSizePixel;
    const newX = Math.min(
      0,
      canvasWidthPixel - x - currentWidth
    );

    return {
      x: newX,
      y: hoverUnderscoreAnnotOffsetPixel.y
    };
  }

  componentWillUnmount() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }

  render() {
    const {
      annotName,
      x, y,
      config: {
        hoverTextFontSizePixel,
        hoverTextColor,
        fontFamily
      }
    } = this.props;
    const {textOffset} = this;
    const {current: textElem} = this.textRef;
    let textColor = hoverTextColor;
    if (!textElem || textElem.attrs['data-annot'] !== annotName) {
      this._timeout = setTimeout(() => {
        this.forceUpdate();
        delete this._timeout;
      }, 0);
      textColor = 'transparent';
    }

    // change stroke color of rect
    return (
      <Group x={x} y={y}>
        <Text
         x={textOffset.x}
         y={textOffset.y}
         stroke="white"
         strokeWidth={4}
         fontSize={hoverTextFontSizePixel}
         fontFamily={fontFamily}
         fill={textColor}
         align="center"
         text={annotName} />
        <Text
         ref={this.textRef}
         x={textOffset.x}
         y={textOffset.y}
         data-annot={annotName}
         fontSize={hoverTextFontSizePixel}
         fontFamily={fontFamily}
         fill={textColor}
         align="center"
         text={annotName} />
      </Group>
    );
  }
}
