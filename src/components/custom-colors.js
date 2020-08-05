import React from 'react';

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

  return React.createElement(as, {
    ...props,
    style: colorStyle,
  }, children);
}
