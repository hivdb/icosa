import {render} from '@testing-library/react';
import {describe, it, beforeEach, expect, vi} from 'vitest';
import type React from 'react';

vi.mock('../components/tabular-report/reports', () => ({
  default: vi.fn(() => null)
}));

vi.mock('./sars2/tabular-report-by-sequences/sub-options', () => ({subOptionProcessors: []}));
vi.mock('./sars2/tabular-report-by-reads/sub-options', () => ({subOptionProcessors: []}));
vi.mock('./hbv/tabular-report-by-sequences/sub-options', () => ({subOptionProcessors: []}));
vi.mock('./hbv/tabular-report-by-reads/sub-options', () => ({subOptionProcessors: []}));
vi.mock('./ebv/tabular-report-by-sequences/sub-options', () => ({subOptionProcessors: []}));
vi.mock('./ebv/tabular-report-by-reads/sub-options', () => ({subOptionProcessors: []}));
vi.mock('./hiv/tabular-report-by-sequences/sub-options', () => ({subOptions: [], subOptionProcessors: []}));
vi.mock('./hiv/tabular-report-by-reads/sub-options', () => ({subOptions: [], subOptionProcessors: []}));
vi.mock('./hiv/tabular-report/use-processors', () => ({default: () => []}));

import Sars2Seq from './sars2/tabular-report-by-sequences/reports';
import Sars2Reads from './sars2/tabular-report-by-reads/reports';
import HbvSeq from './hbv/tabular-report-by-sequences/reports';
import HbvReads from './hbv/tabular-report-by-reads/reports';
import EbvSeq from './ebv/tabular-report-by-sequences/reports';
import EbvReads from './ebv/tabular-report-by-reads/reports';
import HivSeq from './hiv/tabular-report-by-sequences/reports';
import HivReads from './hiv/tabular-report-by-reads/reports';
import useTabularReports from '../components/tabular-report/reports';

const baseProps = {loaded: false, allGenes: [], onFinish: () => {}, subOptionProcessors: []};

describe('tabular report components', () => {
  beforeEach(() => {
    (useTabularReports as any).mockClear();
  });

  const cases: [string, React.ComponentType<any>, any][] = [
    ['Sars2Seq', Sars2Seq, {...baseProps}],
    ['Sars2Reads', Sars2Reads, {...baseProps}],
    ['HbvSeq', HbvSeq, {...baseProps}],
    ['HbvReads', HbvReads, {...baseProps}],
    ['EbvSeq', EbvSeq, {...baseProps}],
    ['EbvReads', EbvReads, {...baseProps}],
    ['HivSeq', HivSeq, {...baseProps, match: {location: {query: {}}}, config: {}}],
    ['HivReads', HivReads, {...baseProps, match: {location: {query: {}}}, config: {}}]
  ];

  it.each(cases)('renders %s', (_, Component, props) => {
    render(<Component {...props} />);
    expect(useTabularReports).toHaveBeenCalled();
  });
});
