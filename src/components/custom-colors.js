import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

CustomColors.propTypes = {
  colors: PropTypes.object,
  children: PropTypes.node,
  as: PropTypes.elementType,
  style: PropTypes.object,
  match: matchShape,
  router: routerShape
};

export default function CustomColors({
  colors,
  children,
  as = 'div',
  style = {},
  ...props
} = {}) {
  const colorStyle = {...style};
  if (colors) {
    for (const name in colors) {
      colorStyle[`--sierra-color-${name}`] = colors[name];
    }
  }
  delete props.match;
  delete props.router;

  return React.createElement(as, {
    ...props,
    style: colorStyle
  }, children);
}
