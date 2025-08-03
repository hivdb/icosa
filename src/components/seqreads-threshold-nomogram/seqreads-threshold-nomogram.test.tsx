import React from 'react';
import {render, screen} from '@testing-library/react';
import {renderHook} from '@testing-library/react';

import ActualThreshold from './actual-threshold';
import CutoffCurve from './cutoff-curve';
import MixtureRateAxis, {useMixtureRateScale} from './mixture-rate-axis';
import MinPrevalenceAxis, {useMinPrevalenceScale} from './min-prevalence-axis';
import ThresholdLine from './threshold-line';
import SeqReadsThresholdNomogram from './index';

/** Helper linear scale for tests. */
function createLinearScale() {
  const scale = (v: number) => v * 10;
  (scale as any).range = () => [0, 100];
  (scale as any).domain = () => [0, 10];
  return scale as any;
}

describe('seqreads threshold nomogram components', () => {
  it('useMixtureRateScale provides domain and range', () => {
    const {result} = renderHook(() =>
      useMixtureRateScale({width: 400, mixtureRateTicks: [0, 0.01, 0.1]})
    );
    expect(result.current).toBeInstanceOf(Function);
    expect(result.current.domain()[0]).toBe(0);
  });

  it('useMinPrevalenceScale maps values correctly', () => {
    const {result} = renderHook(() =>
      useMinPrevalenceScale({height: 200, minPrevalenceDomain: [0, 0.3]})
    );
    expect(result.current(0.15)).toBeGreaterThan(0);
  });

  it('renders ActualThreshold marker and label', () => {
    const scale = createLinearScale();
    const {container} = render(
      <svg>
        <ActualThreshold
          thresholdX={1}
          thresholdY={2}
          scaleX={scale}
          scaleY={scale}
        />
      </svg>
    );
    expect(container.textContent).toContain('Applied thresholds');
    expect(container.querySelector('circle')).not.toBeNull();
  });

  it('renders CutoffCurve paths', () => {
    const scale = createLinearScale();
    const {container} = render(
      <svg>
        <CutoffCurve
          cutoffKeyPoints={[
            {mixtureRate: 1, minPrevalence: 1},
            {mixtureRate: 2, minPrevalence: 2}
          ]}
          mixtureRateScale={scale}
          minPrevalenceScale={scale}
        />
      </svg>
    );
    expect(container.querySelectorAll('path').length).toBe(2);
  });

  it('renders MixtureRateAxis with ticks', () => {
    const scale = renderHook(() =>
      useMixtureRateScale({width: 400, mixtureRateTicks: [0, 0.01, 0.1]})
    ).result.current;
    const {container} = render(
      <svg>
        <MixtureRateAxis scale={scale} height={200} ticks={[0, 0.01, 0.1]} />
      </svg>
    );
    expect(container.textContent).toContain('1%');
  });

  it('renders MinPrevalenceAxis with ticks', () => {
    const scale = renderHook(() =>
      useMinPrevalenceScale({height: 200, minPrevalenceDomain: [0, 0.3]})
    ).result.current;
    const {container} = render(
      <svg>
        <MinPrevalenceAxis scale={scale} ticks={[0, 0.1, 0.2, 0.3]} />
      </svg>
    );
    expect(container.textContent).toContain('10%');
  });

  it('renders ThresholdLine', () => {
    const scale = createLinearScale();
    const {container} = render(
      <svg>
        <ThresholdLine
          direction="horizontal"
          threshold={1}
          thresholdCmp=">"
          scaleX={scale}
          scaleY={scale}
          color="#000"
        />
      </svg>
    );
    expect(container.querySelector('line')).not.toBeNull();
  });

  it('renders full SeqReadsThresholdNomogram', () => {
    const {container} = render(
      <SeqReadsThresholdNomogram
        cutoffKeyPoints={[{
          mixtureRate: 0.001,
          minPrevalence: 0.1,
          isAboveMixtureRateThreshold: true,
          isBelowMinPrevalenceThreshold: false
        }]}
        mixtureRateThreshold={0.001}
        minPrevalenceThreshold={0.1}
        mixtureRateActual={0.001}
        minPrevalenceActual={0.1}
        width={400}
        height={200}
        mixtureRateTicks={[0, 0.001, 0.01]}
        minPrevalenceTicks={[0, 0.1, 0.2]}
      />
    );
    expect(container.textContent).toContain('Applied thresholds');
  });
});
