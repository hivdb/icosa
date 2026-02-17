import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect, vi} from 'vitest';
import React from 'react';
import type {Match, Router} from 'found';

import {SectionInner} from '../../../../src/components/collapsable/section';
import Context, {CollapsableContextValue} from '../../../../src/components/collapsable/context';
import {H2, H3} from '../../../../src/components/heading-tags';

function setup() {
  const containerRef = {current: document.createElement('div')};
  const ctx = new CollapsableContextValue(containerRef, ['h3']);
  return ctx;
}

// Helper to create mock match/router objects for tests
const mockMatch = (hash = ''): Match => ({location: {hash}} as Match);
const mockRouter = (): Router => ({} as Router);

describe('SectionInner', () => {
  it('toggles expansion on click', () => {
    const ctx = setup();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="sec">Title</H3>
          <div>Body</div>
        </SectionInner>
      </Context.Provider>
    );
    const toggle = screen.getByLabelText('collapse');
    fireEvent.click(toggle);
    expect(screen.getByLabelText('expand')).toBeInTheDocument();
  });

  it('toggles expansion on touch', () => {
    const ctx = setup();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="touch-sec">Touch Title</H3>
          <div>Body</div>
        </SectionInner>
      </Context.Provider>
    );
    const toggle = screen.getByLabelText('collapse');
    fireEvent.touchStart(toggle);
    expect(screen.getByLabelText('expand')).toBeInTheDocument();
  });

  it('prevents default on touch end', () => {
    const ctx = setup();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="touch-end-sec">Title</H3>
        </SectionInner>
      </Context.Provider>
    );
    const toggle = screen.getByLabelText('collapse');
    const event = new TouchEvent('touchend', {bubbles: true, cancelable: true});
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    toggle.dispatchEvent(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not leak router/match props to DOM', () => {
    const ctx = setup();
    const {container} = render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={2}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H2 id="sec2">Title</H2>
        </SectionInner>
      </Context.Provider>
    );
    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('router')).toBeNull();
    expect(section?.getAttribute('match')).toBeNull();
  });

  it('sets data-level attribute', () => {
    const ctx = setup();
    const {container} = render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={4}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <div>Content</div>
        </SectionInner>
      </Context.Provider>
    );
    const section = container.querySelector('section');
    expect(section?.getAttribute('data-level')).toBe('4');
  });

  it('sets data-expanded attribute when expanded', () => {
    const ctx = setup();
    const {container} = render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="expanded-sec">Title</H3>
        </SectionInner>
      </Context.Provider>
    );
    const toggle = screen.getByLabelText('collapse');
    fireEvent.click(toggle);
    const section = container.querySelector('section');
    expect(section?.hasAttribute('data-expanded')).toBe(true);
  });

  it('applies minHeight style when expanded', () => {
    const ctx = setup();
    const {container} = render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="min-height-sec">Title</H3>
          <div>Content</div>
        </SectionInner>
      </Context.Provider>
    );
    const toggle = screen.getByLabelText('collapse');
    fireEvent.click(toggle);
    const section = container.querySelector('section');
    expect(section?.style.minHeight).toBeTruthy();
  });

  it('registers collapsable anchor on mount', () => {
    const ctx = setup();
    const registerSpy = vi.fn();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={registerSpy}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="register-test">Title</H3>
        </SectionInner>
      </Context.Provider>
    );
    // getAnchor may return null if the heading structure isn't recognized
    expect(registerSpy).toHaveBeenCalled();
    expect(registerSpy.mock.calls[0][1]).toBe('h3');
    expect(registerSpy.mock.calls[0][2]).toBe(false);
  });

  it('registers with alwaysCollapsable flag', () => {
    const ctx = setup();
    const registerSpy = vi.fn();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          alwaysCollapsable={true}
          registerCollapsableAnchor={registerSpy}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <H3 id="always-test">Title</H3>
        </SectionInner>
      </Context.Provider>
    );
    expect(registerSpy).toHaveBeenCalled();
    expect(registerSpy.mock.calls[0][1]).toBe('h3');
    expect(registerSpy.mock.calls[0][2]).toBe(true);
  });

  it('calls getClosestCollapsableAnchor when hash is present', () => {
    const ctx = setup();
    const getClosestSpy = vi.fn(() => ({anchor: null, shouldCollapseOther: false}));

    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('#hash-match')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={getClosestSpy}
        >
          <H3 id="hash-match">Title</H3>
        </SectionInner>
      </Context.Provider>
    );
    expect(getClosestSpy).toHaveBeenCalledWith('hash-match');
  });

  it('handles function children with onLoad callback', async () => {
    const ctx = setup();
    const onLoadSpy = vi.fn();

    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          {({onLoad}: {onLoad: () => void}) => {
            onLoadSpy.mockImplementation(onLoad);
            return <div>Dynamic content</div>;
          }}
        </SectionInner>
      </Context.Provider>
    );

    expect(screen.getByText('Dynamic content')).toBeInTheDocument();

    // Call onLoad and verify it triggers update
    onLoadSpy();
    await waitFor(() => {
      expect(screen.getByText('Dynamic content')).toBeInTheDocument();
    });
  });

  it('handles sections without heading child', () => {
    const ctx = setup();
    const registerSpy = vi.fn();

    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={registerSpy}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <div>No heading here</div>
        </SectionInner>
      </Context.Provider>
    );

    expect(registerSpy).toHaveBeenCalledWith(null, 'h3', false);
  });

  it('passes through additional props to section element', () => {
    const ctx = setup();
    const {container} = render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch('')}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
          data-testid="custom-section"
          className="custom-class"
        >
          <div>Content</div>
        </SectionInner>
      </Context.Provider>
    );

    const section = container.querySelector('section');
    expect(section?.getAttribute('data-testid')).toBe('custom-section');
    expect(section?.className).toContain('custom-class');
  });

  it('handles match without location', () => {
    const ctx = setup();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={mockMatch()}
          router={mockRouter()}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <div>Content</div>
        </SectionInner>
      </Context.Provider>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
