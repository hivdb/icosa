import React from 'react';

export default function CustomColors({
  colors,
  className,
  children
} = {}) {
  const colorStyle = {};
  if (colors) {
    for (const name in colors) {
      colorStyle[`--sierra-color-${name}`] = colors[name];
    }
  }

  return <div className={className} style={colorStyle}>
    {children}
  </div>;
}
