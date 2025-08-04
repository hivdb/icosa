vi.mock('./dr-interpretation', () => ({}));
vi.mock('./dr-mutation-scores', () => ({}));
vi.mock('./report-paginator', () => ({}));
vi.mock('./mutation-stats', () => ({default: () => 'ms'}));
vi.mock('./seq-summary', () => ({}));
vi.mock('./seq-mutation-prevalence', () => ({}));
vi.mock('./alg-comparison', () => ({}));
vi.mock('./validation-report', () => ({}));
vi.mock('./mutation-viewer', () => ({}));
vi.mock('./report-header', () => ({}));
vi.mock('./report-section', () => ({}));
vi.mock('./mutation-list', () => ({}));
vi.mock('../../utils/config-context', () => ({}));
vi.mock('./references', () => ({default: {}, RefContextWrapper: {}}));
vi.mock('./download-codfreqs', () => ({}));

import {MutationStats} from './index';

test('exports MutationStats component', () => {
  expect(MutationStats).toBeDefined();
});
