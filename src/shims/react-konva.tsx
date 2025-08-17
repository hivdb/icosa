import React from 'react';

/**
 * Test-only shim for `react-konva` to avoid native `canvas` bindings.
 * These lightweight components render simple DOM wrappers so modules that import
 * `react-konva` can be evaluated in Vitest/JSDOM without pulling in Node-canvas.
 */

export const Stage: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({children, ...rest}) => (
  <div data-testid="react-konva-stage" {...rest}>
    {children}
  </div>
);

export const Layer: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({children, ...rest}) => (
  <div data-testid="react-konva-layer" {...rest}>
    {children}
  </div>
);

export const Group: React.FC<React.PropsWithChildren<Record<string, unknown>>> = ({children, ...rest}) => (
  <div data-testid="react-konva-group" {...rest}>
    {children}
  </div>
);

export const Rect: React.FC<Record<string, unknown>> = props => (
  <div data-testid="react-konva-rect" {...props} />
);

export const Circle: React.FC<Record<string, unknown>> = props => (
  <div data-testid="react-konva-circle" {...props} />
);

export const Text: React.FC<{text?: string} & Record<string, unknown>> = ({text, ...rest}) => (
  <span data-testid="react-konva-text" {...rest}>{text}</span>
);

export default {
  Stage,
  Layer,
  Group,
  Rect,
  Circle,
  Text
};

