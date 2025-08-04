import React from 'react';
import cx from 'classnames';
import { Group } from '@vx/group';
import { stack as d3stack } from 'd3-shape';
import { Bar } from '@vx/shape';

/**
 * Props for {@link BarStack} component.
 *
 * @template Datum - type of a single data record
 */
export interface BarStackProps<Datum> {
  /** Input data array */
  data: Datum[];
  /** Accessor for x values */
  x: (d: Datum) => string | number;
  /** Horizontal scale function */
  xScale: any;
  /** Vertical scale function */
  yScale: any;
  /** Color mapping function */
  color: (x: string | number, key: string) => string;
  /** Keys for stack */
  keys: string[];
  /** Optional CSS class */
  className?: string;
  /** Top offset */
  top?: number;
  /** Left offset */
  left?: number;
  /** Custom render callback */
  children?: (bars: any[]) => React.ReactNode;
  /** Accessor for lower value */
  y0?: (d: any) => number;
  /** Accessor for upper value */
  y1?: (d: any) => number;
  /** Stack value accessor */
  value?: ((d: Datum, key: string) => number) | number;
  /** Additional props passed to each Bar */
  [key: string]: any;
}

/**
 * Render stacked bars for the provided data using d3-shape stack.
 *
 * @param props - {@link BarStackProps} component properties
 * @returns Rendered group of SVG bars
 */
export default function BarStack<Datum>({
  data,
  className,
  top,
  left,
  x,
  y0 = (d) => d[0],
  y1 = (d) => d[1],
  xScale,
  yScale,
  color,
  keys,
  value,
  children,
  ...restProps
}: BarStackProps<Datum>) {
  const stack = d3stack();
  if (keys) stack.keys(keys);
  if (value) stack.value(value as any);

  const stacks = stack(data as any);

  const barWidth = xScale.bandwidth();

  const barStacks = stacks.map((barStack, i) => {
    const key = barStack.key as string;
    return {
      index: i,
      key,
      bars: barStack.map((bar: any, j: number) => {
        const barHeight = yScale(y0(bar)) - yScale(y1(bar)) - 0.5;
        const barY = yScale(y1(bar));
        const barX = xScale(x(bar.data));

        return {
          bar,
          key,
          index: j,
          height: barHeight,
          width: barWidth,
          x: barX,
          y: barY,
          color: color(x(bar.data), key)
        };
      })
    };
  });

  if (children) return <>{children(barStacks)}</>;

  return (
    <Group className={cx('vx-bar-stack', className)} top={top} left={left}>
      {barStacks.map((barStack) => {
        return barStack.bars.map((bar: any) => {
          return (
            <Bar
              key={`bar-stack-${barStack.index}-${bar.index}`}
              x={bar.x}
              y={bar.y}
              height={bar.height}
              width={bar.width}
              fill={bar.color}
              {...restProps}
            />
          );
        });
      })}
    </Group>
  );
}
