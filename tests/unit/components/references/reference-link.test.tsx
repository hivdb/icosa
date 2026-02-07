import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../src/components/references/inline-reference', () => ({ default: () => <div data-testid="inline-ref" /> }));
vi.mock('../../../../src/components/references/build-ref', () => ({ __esModule: true, default: (ref: any) => <span>{ref.title}</span> }));
vi.mock('../../../../src/components/references/style.module.scss', () => ({ __esModule: true, default: { 'ref-link': 'ref-link', 'ref-popup': 'ref-popup' } }));
import RefLink from '../../../../src/components/references/reference-link';
import ReferenceContext, { ReferenceObject } from '../../../../src/components/references/reference-context';

describe('RefLink', () => {
  it('renders InlineRef when identifier ends with #inline', () => {
    render(
      <ReferenceContext.Provider value={new ReferenceObject({})}>
        <RefLink identifier="foo#inline" />
      </ReferenceContext.Provider>
    );
    expect(screen.getByTestId('inline-ref')).toBeTruthy();
  });
});
