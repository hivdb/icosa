import React from 'react';

interface CustomColorsProps extends React.HTMLAttributes<HTMLElement> {
  colors?: Record<string, string>;
  as?: React.ElementType;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export default function CustomColors({
  colors,
  children,
  as: As = 'div',
  style = {},
  ...props
}: CustomColorsProps = {}) {
  const colorStyle: React.CSSProperties = {...style};
  if (colors) {
    for (const name in colors) {
      colorStyle[`--sierra-color-${name}` as any] = colors[name];
    }
  }
  delete (props as any).match;
  delete (props as any).router;

  return React.createElement(As, {
    ...props,
    style: colorStyle
  }, children);
}
