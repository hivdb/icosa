import type {Preset} from '../../../../src/components/genome-map/types';
import {scaleMultipleLinears} from '../../../../src/components/genome-map/helpers';

/**
 * Create a base preset for testing GenomeMap component.
 * Returns a fresh preset object with common default values.
 */
export const createBasePreset = (): Preset => ({
  name: 'test',
  label: 'Test',
  width: 200,
  height: 100,
  paddingTop: 0,
  paddingLeft: 0,
  paddingRight: 0,
  domains: [{posStart: 0, posEnd: 10, scaleRatio: 1}],
  hidePositionAxis: false,
  positionAxis: {posOffset: 0, tickCount: 5, roundToNearest: 1},
  positionGroups: [
    {name: 'g', positions: [{name: 'p1', pos: 2}]}
  ],
  regions: [{name: 'r1', posStart: 0, posEnd: 3, shapeType: 'rect'}],
  positionExtendSize: 10
});

/**
 * Create a simple scale for testing genome-map components.
 * @param domains - Domain configuration [[posStart, posEnd, scaleRatio], ...]
 * @param range - Range configuration [rangeStart, rangeEnd]
 */
export const createTestScale = (
  domains: [number, number, number][] = [[0, 10, 1]],
  range: [number, number] = [0, 100]
) => scaleMultipleLinears(domains, range);

/**
 * Assert that an SVG element is rendered in the container.
 * @param container - The container element to search within
 * @returns The SVG element if found
 */
export const assertSvgRendered = (container: HTMLElement) => {
  const svg = container.querySelector('svg');
  expect(svg).toBeInTheDocument();
  return svg;
};

/**
 * Assert that a viewBox attribute has valid dimensions (no NaN values).
 * @param svg - The SVG element to check
 * @returns The viewBox string if valid
 */
export const assertValidViewBox = (svg: Element | null) => {
  expect(svg).toHaveAttribute('viewBox');
  const viewBox = svg?.getAttribute('viewBox');
  expect(viewBox).toBeTruthy();
  const dimensions = viewBox?.split(' ').map(Number);
  expect(dimensions?.every(n => !isNaN(n))).toBe(true);
  return viewBox;
};
