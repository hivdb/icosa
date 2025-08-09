import React from 'react';

interface CustomColorsProps extends React.HTMLAttributes<HTMLElement> {
  /** Mapping of CSS variable names to color values. */
  colors?: Record<string, string>;
  /** HTML tag or component to render as. */
  as?: React.ElementType;
  /** Inline styles applied to the element. */
  style?: React.CSSProperties;
  /** Optional element children. */
  children?: React.ReactNode;
}

/**
 * Render an element with custom CSS color variables applied.
 *
 * @param props - {@link CustomColorsProps} describing rendering options.
 * @returns The rendered element.
 */
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
      (colorStyle as Record<string, string | number>)[`--sierra-color-${name}`] =
        colors[name];
    }
  }
  delete (props as any).match;
  delete (props as any).router;

  return React.createElement(As, {
    ...props,
    style: colorStyle
  }, children);
}
