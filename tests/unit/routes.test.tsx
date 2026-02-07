import React from 'react';
import {describe, it, expect, vi} from 'vitest';

vi.mock('../../src/./components/layout', () => ({default: () => null}));
vi.mock('../../src/./views/home', () => ({default: () => null}));
vi.mock('../../src/./views/sars2', () => ({default: () => () => null}));
vi.mock('../../src/./views/hiv', () => ({default: () => () => null}));
vi.mock('../../src/./views/ebv', () => ({default: () => () => null}));
vi.mock('../../src/./views/hbv', () => ({default: () => () => null}));
vi.mock('../../src/./views/mut-annot-viewer', () => ({default: () => null}));
vi.mock('../../src/./views/genome-viewer', () => ({default: () => null}));
vi.mock('../../src/./views/ngs2codfreq-dev', () => ({default: () => null}));
vi.mock('../../src/./views/markdown-debugger', () => ({default: () => null}));
vi.mock('../../src/./views/markdown-debugger2', () => ({default: () => null}));
vi.mock('../../src/./components/debug-ref-data-loader', () => ({default: () => null}));
vi.mock('../../src/./views/seqreads-threshold-nomogram-debugger', () => ({default: () => null}));
vi.mock('../../src/./views/protein-viewer-dev', () => ({default: () => null}));

import routes from '../../src/routes';

describe('routes', () => {
  it('is a valid React element', () => {
    expect(React.isValidElement(routes)).toBe(true);
  });
});
