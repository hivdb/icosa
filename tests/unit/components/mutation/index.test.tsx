import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../../src/utils/use-messages', () => ({
  default: vi.fn()
}));

vi.mock('../../../../src/components/popup', () => ({
  HoverPopup: ({children}: {children: React.ReactNode}) => <div data-testid="hover-popup">{children}</div>
}));

vi.mock('../../../../src/components/markdown', () => ({
  __esModule: true,
  default: ({children}: any) => <div data-testid="markdown">{children}</div>
}));

import Mutation from '../../../../src/components/mutation';
import useMessages from '../../../../src/utils/use-messages';
import style from '../../../../src/components/mutation/style.module.scss';

const baseConfig = {
  geneDisplay: {RT: 'Reverse Transcriptase'},
  messages: {}
};

describe('Mutation', () => {
  beforeEach(() => {
    vi.mocked(useMessages).mockReturnValue(['<mutation-popup>', '', '', '', '', '']);
  });

  it('renders mutation text and data attributes', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isDRM
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.querySelector(`.${style['mut-text']}`)).toHaveTextContent('M184V');
    expect(item.getAttribute('data-drm')).toBe('true');
  });

  it('renders as custom element type', () => {
    const {container} = render(
      <Mutation
        as="div"
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('renders with unusual mutation highlighting', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnusual
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.getAttribute('data-unusual')).toBe('true');
  });

  it('renders with APOBEC mutation highlighting', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="G190A"
        isApobecMutation
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.getAttribute('data-apobec')).toBe('true');
  });

  it('renders with APOBEC DRM highlighting', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="G190A"
        isApobecDRM
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.getAttribute('data-apobec-drm')).toBe('true');
  });

  it('renders unsequenced mutation without popup', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced
        config={baseConfig}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.getAttribute('data-unsequenced')).toBe('true');
    expect(container.querySelector('[data-testid="hover-popup"]')).not.toBeInTheDocument();
  });

  it('renders with hover popup when message is available', () => {
    vi.mocked(useMessages).mockReturnValue(['Mutation info: ${mutation}', '', '', '', '', '']);
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    expect(container.querySelector('[data-testid="hover-popup"]')).toBeInTheDocument();
  });

  it('renders with totalReads annotation', () => {
    render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        totalReads={1500}
        config={baseConfig}
      />
    );
    expect(screen.getByText(/cov=1,500/)).toBeInTheDocument();
  });

  it('renders with amino acid reads', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        allAAReads={[
          {aminoAcid: 'V', percent: 85.5},
          {aminoAcid: 'I', percent: 14.5}
        ]}
        config={baseConfig}
      />
    );
    const list = container.querySelector(`.${style['aa-percent-list']}`);
    expect(list).toBeInTheDocument();
    expect(container.textContent).toContain('V:');
    expect(container.textContent).toContain('86%'); // 85.5 rounds to 86
    expect(container.textContent).toContain('I:');
    expect(container.textContent).toContain('15%'); // 14.5 rounds to 15
  });

  it('sorts amino acid reads by percent descending', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        allAAReads={[
          {aminoAcid: 'I', percent: 14.5},
          {aminoAcid: 'V', percent: 85.5}
        ]}
        config={baseConfig}
      />
    );
    const items = container.querySelectorAll(`.${style['aa-percent-item']}`);
    expect(items[0]).toHaveTextContent('V:');
    expect(items[1]).toHaveTextContent('I:');
  });

  it('replaces deletion character with delta symbol', () => {
    render(
      <Mutation
        gene="RT"
        text="M184-"
        isUnsequenced={false}
        allAAReads={[{aminoAcid: '-', percent: 100}]}
        config={baseConfig}
      />
    );
    expect(screen.getByText(/Δ:/)).toBeInTheDocument();
  });

  it('formats percent with 0 decimals for values >= 10', () => {
    render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        allAAReads={[{aminoAcid: 'V', percent: 95.7}]}
        config={baseConfig}
      />
    );
    expect(screen.getByText(/96%/)).toBeInTheDocument();
  });

  it('formats percent with 1 decimal for values < 10', () => {
    render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        allAAReads={[{aminoAcid: 'V', percent: 5.67}]}
        config={baseConfig}
      />
    );
    expect(screen.getByText(/5.7%/)).toBeInTheDocument();
  });

  it('renders with DRM drug class information', () => {
    vi.mocked(useMessages).mockReturnValue([
      'DRM for ${drugClass}',
      '',
      '',
      '',
      'DRM message',
      'NRTI-specific message'
    ]);
    render(
      <Mutation
        gene="RT"
        text="M184V"
        isDRM
        DRMDrugClass={{name: 'NRTI', fullName: 'Nucleoside RTI'}}
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    expect(screen.getByTestId('hover-popup')).toBeInTheDocument();
  });

  it('uses drug-class-specific message when available', () => {
    vi.mocked(useMessages).mockReturnValue([
      'Mutation: ${mutation}',
      '',
      '',
      '',
      'Generic DRM',
      'NRTI-specific DRM message'
    ]);
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isDRM
        DRMDrugClass={{name: 'NRTI', fullName: 'Nucleoside RTI'}}
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    expect(container.querySelector('[data-testid="hover-popup"]')).toBeInTheDocument();
  });

  it('uses generic DRM message when drug-class-specific not available', () => {
    vi.mocked(useMessages).mockReturnValue([
      'Mutation: ${mutation}',
      '',
      '',
      '',
      'Generic DRM message',
      '<mutation-is-drm-NRTI>'
    ]);
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isDRM
        DRMDrugClass={{name: 'NRTI', fullName: 'Nucleoside RTI'}}
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    expect(container.querySelector('[data-testid="hover-popup"]')).toBeInTheDocument();
  });

  it('disables highlighting when config flags are false', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnusual
        isDRM
        isApobecMutation
        isApobecDRM
        isUnsequenced={false}
        config={{
          ...baseConfig,
          highlightUnusualMutation: false,
          highlightDRM: false,
          highlightApobecMutation: false,
          highlightApobecDRM: false
        }}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.getAttribute('data-unusual')).toBe('false');
    expect(item.getAttribute('data-drm')).toBe('false');
    expect(item.getAttribute('data-apobec')).toBe('false');
    expect(item.getAttribute('data-apobec-drm')).toBe('false');
  });

  it('hides amino acid list when only one amino acid', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        allAAReads={[{aminoAcid: 'V', percent: 100}]}
        config={baseConfig}
      />
    );
    const list = container.querySelector(`.${style['aa-percent-list']}`);
    expect(list).toHaveAttribute('data-hide-aa', 'true');
  });

  it('shows amino acid list when multiple amino acids', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        allAAReads={[
          {aminoAcid: 'V', percent: 85},
          {aminoAcid: 'I', percent: 15}
        ]}
        config={baseConfig}
      />
    );
    const list = container.querySelector(`.${style['aa-percent-list']}`);
    expect(list).toHaveAttribute('data-hide-aa', 'false');
  });

  it('renders comma separator', () => {
    const {container} = render(
      <Mutation
        gene="RT"
        text="M184V"
        isUnsequenced={false}
        config={baseConfig}
      />
    );
    const comma = container.querySelector(`.${style.comma}`);
    expect(comma).toBeInTheDocument();
    expect(comma?.textContent).toBe(', ');
  });
});
