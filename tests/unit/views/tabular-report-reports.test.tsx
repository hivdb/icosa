import {render} from '@testing-library/react';
import {describe, it, beforeEach, expect, vi} from 'vitest';
import type React from 'react';

vi.mock('../../../src/components/tabular-report/reports', () => ({
  default: vi.fn(() => null)
}));

vi.mock('../../../src/views/sars2/tabular-report-by-sequences/sub-options', () => ({subOptionProcessors: []}));
vi.mock('../../../src/views/sars2/tabular-report-by-reads/sub-options', () => ({subOptionProcessors: []}));
vi.mock('../../../src/views/hbv/tabular-report-by-sequences/sub-options', () => ({subOptionProcessors: []}));
vi.mock('../../../src/views/hbv/tabular-report-by-reads/sub-options', () => ({subOptionProcessors: []}));
vi.mock('../../../src/views/ebv/tabular-report-by-sequences/sub-options', () => ({subOptionProcessors: []}));
vi.mock('../../../src/views/ebv/tabular-report-by-reads/sub-options', () => ({subOptionProcessors: []}));
vi.mock('../../../src/views/hiv/tabular-report-by-sequences/sub-options', () => ({subOptions: [], subOptionProcessors: []}));
vi.mock('../../../src/views/hiv/tabular-report-by-reads/sub-options', () => ({subOptions: [], subOptionProcessors: []}));
vi.mock('../../../src/views/hiv/tabular-report/use-processors', () => ({default: () => []}));

import Sars2Seq from '../../../src/views/sars2/tabular-report-by-sequences/reports';
import Sars2Reads from '../../../src/views/sars2/tabular-report-by-reads/reports';
import HbvSeq from '../../../src/views/hbv/tabular-report-by-sequences/reports';
import HbvReads from '../../../src/views/hbv/tabular-report-by-reads/reports';
import EbvSeq from '../../../src/views/ebv/tabular-report-by-sequences/reports';
import EbvReads from '../../../src/views/ebv/tabular-report-by-reads/reports';
import HivSeq from '../../../src/views/hiv/tabular-report-by-sequences/reports';
import HivReads from '../../../src/views/hiv/tabular-report-by-reads/reports';
import useTabularReports from '../../../src/components/tabular-report/reports';

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
