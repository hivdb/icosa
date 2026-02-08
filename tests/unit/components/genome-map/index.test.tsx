import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import GenomeMap from '../../../../src/components/genome-map';
import {createBasePreset, assertSvgRendered, assertValidViewBox} from './test-utils';

vi.mock('../../../../src/components/markdown', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>
}));

describe('GenomeMap', () => {
  it('renders svg', () => {
    const {container} = render(<GenomeMap preset={createBasePreset()} />);
    assertSvgRendered(container);
  });

  it('renders with custom className', () => {
    const {container} = render(<GenomeMap preset={createBasePreset()} className="custom-map" />);
    expect(container.querySelector('.custom-map')).toBeInTheDocument();
  });

  it('renders extra buttons', () => {
    const {getByText} = render(
      <GenomeMap preset={createBasePreset()} extraButtons={<button>Extra</button>} />
    );
    expect(getByText('Extra')).toBeInTheDocument();
  });

  it('renders footnote when provided', () => {
    const preset = {...createBasePreset(), footnote: 'Test footnote'};
    const {getByText} = render(<GenomeMap preset={preset} />);
    expect(getByText('Test footnote')).toBeInTheDocument();
  });

  it('does not render footnote when not provided', () => {
    const {container} = render(<GenomeMap preset={createBasePreset()} />);
    expect(container.querySelector('.footnote')).not.toBeInTheDocument();
  });

  it('renders with coverages', () => {
    const preset = {
      ...createBasePreset(),
      coverages: {
        height: 50,
        posStart: 0,
        posEnd: 10,
        coverages: [{position: 5, coverage: 100}]
      }
    };
    const {container} = render(<GenomeMap preset={preset} />);
    assertSvgRendered(container);
  });

  it('renders without position axis when hidePositionAxis is true', () => {
    const preset = {...createBasePreset(), hidePositionAxis: true};
    const {container} = render(<GenomeMap preset={preset} />);
    assertSvgRendered(container);
  });

  it('handles positions with turns', () => {
    const preset = {
      ...createBasePreset(),
      positionGroups: [{
        name: 'g',
        positions: [{name: 'p1', pos: 2, turns: [[100, 50, 1] as [number, number, number], [150, 60, -1] as [number, number, number]]}]
      }]
    };
    const {container} = render(<GenomeMap preset={preset} />);
    assertSvgRendered(container);
  });

  it('handles positions outside domain range', () => {
    const preset = {
      ...createBasePreset(),
      positionGroups: [{
        name: 'g',
        positions: [
          {name: 'p1', pos: -5, turns: [[50, 50, 1] as [number, number, number]]},
          {name: 'p2', pos: 20, turns: [[250, 50, 1] as [number, number, number]]}
        ]
      }]
    };
    const {container} = render(<GenomeMap preset={preset} />);
    assertSvgRendered(container);
  });

  it('handles position groups with addOffsetY', () => {
    const preset = {
      ...createBasePreset(),
      positionGroups: [{name: 'g', addOffsetY: 20, positions: [{name: 'p1', pos: 2}]}]
    };
    const {container} = render(<GenomeMap preset={preset} />);
    assertSvgRendered(container);
  });

  it('handles position groups without addOffsetY (regression test for NaN bug)', () => {
    // This tests the bug fix where addOffsetY was not defaulted to 0
    // Without the || 0 fallback, undefined + number would produce NaN
    const preset = {
      ...createBasePreset(),
      positionGroups: [{
        name: 'g',
        // addOffsetY is intentionally omitted (undefined)
        positions: [{name: 'p1', pos: 2}]
      }]
    };
    const {container} = render(<GenomeMap preset={preset} />);
    const svg = assertSvgRendered(container);
    assertValidViewBox(svg);
  });

  it('calculates correct SVG dimensions', () => {
    const {container} = render(<GenomeMap preset={createBasePreset()} />);
    const svg = assertSvgRendered(container);
    const viewBox = assertValidViewBox(svg);
    expect(viewBox).toMatch(/\d+ \d+ \d+ \d+/);
  });

  it('calculates minX and maxX from position turns', () => {
    // Test with positions that have turns extending beyond initial x values
    const preset = {
      ...createBasePreset(),
      positionGroups: [{
        name: 'g',
        positions: [
          {name: 'p1', pos: 2, turns: [[50, 0, 1] as [number, number, number], [200, 10, 1] as [number, number, number]]},
          {name: 'p2', pos: 5, turns: [[150, 0, 1] as [number, number, number], [10, 10, -1] as [number, number, number]]}
        ]
      }]
    };
    const {container} = render(<GenomeMap preset={preset} />);
    const svg = assertSvgRendered(container);
    assertValidViewBox(svg);
  });

  it('updates minX and maxX when turn x values are at extremes', () => {
    // Test positions with turns that set new minX (x < minX) and maxX (x > maxX)
    const preset = {
      ...createBasePreset(),
      positionGroups: [{
        name: 'g',
        positions: [
          {name: 'p1', pos: 5, turns: [[100, 0, 1] as [number, number, number]]}, // Will set initial minX/maxX to 100
          {name: 'p2', pos: 3, turns: [[50, 0, -1] as [number, number, number]]}, // x < minX (50 < 100)
          {name: 'p3', pos: 7, turns: [[200, 0, 1] as [number, number, number]]} // x > maxX (200 > 100)
        ]
      }]
    };
    const {container} = render(<GenomeMap preset={preset} />);
    const svg = assertSvgRendered(container);
    assertValidViewBox(svg);
  });
});
