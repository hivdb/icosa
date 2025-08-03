import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./inline-reference', () => ({ default: () => <div data-testid="inline-ref" /> }));
vi.mock('./build-ref', () => ({ __esModule: true, default: (ref: any) => <span>{ref.title}</span> }));
vi.mock('./style.module.scss', () => ({ __esModule: true, default: { 'ref-link': 'ref-link', 'ref-popup': 'ref-popup' } }));
import RefLink from './reference-link';
import ReferenceContext from './reference-context';

describe('RefLink', () => {
  it('renders InlineRef when identifier ends with #inline', () => {
    render(
      <ReferenceContext.Provider value={{}}>
        <RefLink identifier="foo#inline" />
      </ReferenceContext.Provider>
    );
    expect(screen.getByTestId('inline-ref')).toBeTruthy();
  });
});
