vi.mock('../../../../src/components/report/dr-interpretation', () => ({}));
vi.mock('../../../../src/components/report/dr-mutation-scores', () => ({}));
vi.mock('../../../../src/components/report/report-paginator', () => ({}));
vi.mock('../../../../src/components/report/mutation-stats', () => ({default: () => 'ms'}));
vi.mock('../../../../src/components/report/seq-summary', () => ({}));
vi.mock('../../../../src/components/report/seq-mutation-prevalence', () => ({}));
vi.mock('../../../../src/components/report/alg-comparison', () => ({}));
vi.mock('../../../../src/components/report/validation-report', () => ({}));
vi.mock('../../../../src/components/report/mutation-viewer', () => ({}));
vi.mock('../../../../src/components/report/report-header', () => ({}));
vi.mock('../../../../src/components/report/report-section', () => ({}));
vi.mock('../../../../src/components/report/mutation-list', () => ({}));
vi.mock('../../../../src/utils/config-context', () => ({}));
vi.mock('../../../../src/components/report/references', () => ({default: {}, RefContextWrapper: {}}));
vi.mock('../../../../src/components/report/download-codfreqs', () => ({}));

import {MutationStats} from '../../../../src/components/report';

test('exports MutationStats component', () => {
  expect(MutationStats).toBeDefined();
});
