import {render, screen, renderHook} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import SeqReadsThresholdNomogram from './index';
import ActualThreshold from './actual-threshold';
import CutoffCurve from './cutoff-curve';
import MixtureRateAxis, {useMixtureRateScale} from './mixture-rate-axis';
import MinPrevalenceAxis, {useMinPrevalenceScale} from './min-prevalence-axis';
import ThresholdLine from './threshold-line';
import constants from './constants';

const cutoffPoints = [
  {mixtureRate: 0, minPrevalence: 0},
  {mixtureRate: 0.01, minPrevalence: 0.1},
  {mixtureRate: 0.02, minPrevalence: 0.2}
];

describe('SeqReadsThresholdNomogram suite', () => {
  it('renders full nomogram with applied thresholds', () => {
    render(
      <SeqReadsThresholdNomogram
       cutoffKeyPoints={cutoffPoints}
       mixtureRateThreshold={0.01}
       minPrevalenceThreshold={0.1}
       mixtureRateActual={0.005}
       minPrevalenceActual={0.05}
      />
    );
    expect(screen.getByText(/Applied thresholds/)).toBeInTheDocument();
  });

  it('generates increasing mixture rate scale', () => {
    const {result} = renderHook(() => (
      useMixtureRateScale({width: 200, mixtureRateTicks: [0, 0.1, 0.2]})
    ));
    expect(result.current(0.2)).toBeGreaterThan(result.current(0.1));
  });

  it('generates decreasing min prevalence scale', () => {
    const {result} = renderHook(() => (
      useMinPrevalenceScale({height: 200, minPrevalenceDomain: [0, 0.3]})
    ));
    expect(result.current(0.3)).toBeLessThan(result.current(0.1));
  });

  it('renders axes with tick labels', () => {
    const mixScale = renderHook(() => (
      useMixtureRateScale({width: 200, mixtureRateTicks: [0, 0.1, 0.2]})
    )).result.current;
    const prevScale = renderHook(() => (
      useMinPrevalenceScale({height: 200, minPrevalenceDomain: [0, 0.2]})
    )).result.current;
    const {getAllByText} = render(
      <svg>
        <MixtureRateAxis scale={mixScale} height={200} ticks={[0, 0.1, 0.2]} />
        <MinPrevalenceAxis scale={prevScale} ticks={[0, 0.1, 0.2]} />
      </svg>
    );
    expect(getAllByText('10%').length).toBeGreaterThan(0);
    expect(getAllByText('20%').length).toBeGreaterThan(0);
  });

  it('renders cutoff curve and threshold line', () => {
    const mixScale = renderHook(() => (
      useMixtureRateScale({width: 200, mixtureRateTicks: [0, 0.02]})
    )).result.current;
    const prevScale = renderHook(() => (
      useMinPrevalenceScale({height: 200, minPrevalenceDomain: [0, 0.2]})
    )).result.current;
    const {container} = render(
      <svg>
        <CutoffCurve
         cutoffKeyPoints={cutoffPoints}
         mixtureRateScale={mixScale}
         minPrevalenceScale={prevScale}
        />
        <ThresholdLine
         direction="vertical"
         threshold={0.01}
         thresholdCmp="<"
         scaleX={mixScale}
         scaleY={prevScale}
         color="#000"
        />
      </svg>
    );
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(container.querySelector('line')).toBeInTheDocument();
  });

  it('renders actual threshold indicator', () => {
    const mixScale = renderHook(() => (
      useMixtureRateScale({width: 200, mixtureRateTicks: [0, 0.02]})
    )).result.current;
    const prevScale = renderHook(() => (
      useMinPrevalenceScale({height: 200, minPrevalenceDomain: [0, 0.2]})
    )).result.current;
    const {container, getByText} = render(
      <svg>
        <ActualThreshold
         thresholdX={0.01}
         thresholdY={0.1}
         scaleX={mixScale}
         scaleY={prevScale}
        />
      </svg>
    );
    expect(container.querySelector('circle')).toBeInTheDocument();
    expect(getByText(/Applied thresholds/)).toBeInTheDocument();
  });

  it('exposes constant values', () => {
    expect(constants.actualThresholdRadius).toBeGreaterThan(0);
  });
});
