import React from 'react';
import {describe, it, expect, vi} from 'vitest';

vi.mock('./components/layout', () => ({default: () => null}));
vi.mock('./views/home', () => ({default: () => null}));
vi.mock('./views/sars2', () => ({default: () => () => null}));
vi.mock('./views/hiv', () => ({default: () => () => null}));
vi.mock('./views/ebv', () => ({default: () => () => null}));
vi.mock('./views/hbv', () => ({default: () => () => null}));
vi.mock('./views/mut-annot-viewer', () => ({default: () => null}));
vi.mock('./views/genome-viewer', () => ({default: () => null}));
vi.mock('./views/ngs2codfreq-dev', () => ({default: () => null}));
vi.mock('./views/markdown-debugger', () => ({default: () => null}));
vi.mock('./views/markdown-debugger2', () => ({default: () => null}));
vi.mock('./components/debug-ref-data-loader', () => ({default: () => null}));
vi.mock('./views/seqreads-threshold-nomogram-debugger', () => ({default: () => null}));
vi.mock('./views/protein-viewer-dev', () => ({default: () => null}));

import routes from './routes';

describe('routes', () => {
  it('is a valid React element', () => {
    expect(React.isValidElement(routes)).toBe(true);
  });
});
