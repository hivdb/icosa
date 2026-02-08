import {describe, it, expect, beforeEach} from 'vitest';
import React from 'react';

import {CollapsableContextValue} from '../../../../src/components/collapsable/context';

describe('CollapsableContextValue', () => {
  let containerRef: React.RefObject<HTMLDivElement>;
  let context: CollapsableContextValue;

  beforeEach(() => {
    const div = document.createElement('div');
    containerRef = {current: div};
    context = new CollapsableContextValue(containerRef, ['h3', 'h4']);
  });

  describe('registerCollapsableAnchor', () => {
    it('registers anchor when level is in collapsable levels', () => {
      context.registerCollapsableAnchor('test-anchor', 'h3', false);
      const result = context.getClosestCollapsableAnchor('test-anchor');
      expect(result.anchor).toBe('test-anchor');
      expect(result.shouldCollapseOther).toBe(true);
    });

    it('registers anchor when alwaysCollapsable is true regardless of level', () => {
      context.registerCollapsableAnchor('always-anchor', 'h2', true);
      const result = context.getClosestCollapsableAnchor('always-anchor');
      expect(result.anchor).toBe('always-anchor');
    });

    it('does not register anchor when level is not in collapsable levels', () => {
      context.registerCollapsableAnchor('h2-anchor', 'h2', false);
      const result = context.getClosestCollapsableAnchor('h2-anchor');
      expect(result.anchor).toBeNull();
    });

    it('does not register null anchor', () => {
      context.registerCollapsableAnchor(null, 'h3', false);
      const result = context.getClosestCollapsableAnchor(null);
      expect(result.anchor).toBeNull();
    });

    it('does not register duplicate anchor', () => {
      context.registerCollapsableAnchor('dup-anchor', 'h3', false);
      context.registerCollapsableAnchor('dup-anchor', 'h3', false);
      const result = context.getClosestCollapsableAnchor('dup-anchor');
      expect(result.anchor).toBe('dup-anchor');
    });
  });

  describe('getClosestCollapsableAnchor', () => {
    it('returns null anchor when curHash is null', () => {
      const result = context.getClosestCollapsableAnchor(null);
      expect(result.anchor).toBeNull();
      expect(result.shouldCollapseOther).toBe(false);
    });

    it('returns null anchor when curHash is empty string', () => {
      const result = context.getClosestCollapsableAnchor('');
      expect(result.anchor).toBeNull();
      expect(result.shouldCollapseOther).toBe(false);
    });

    it('returns anchor with shouldCollapseOther=true when anchor is registered', () => {
      context.registerCollapsableAnchor('registered', 'h3', false);
      const result = context.getClosestCollapsableAnchor('registered');
      expect(result.anchor).toBe('registered');
      expect(result.shouldCollapseOther).toBe(true);
    });

    it('searches for closest collapsable anchor in DOM hierarchy', () => {
      const container = containerRef.current!;
      
      // Create DOM structure: section > h3#parent > section > div#child
      const parentSection = document.createElement('section');
      parentSection.setAttribute('data-level', '3');
      
      const parentHeader = document.createElement('h3');
      parentHeader.id = 'parent-header';
      parentSection.appendChild(parentHeader);
      
      const childSection = document.createElement('section');
      childSection.setAttribute('data-level', '4');
      parentSection.appendChild(childSection);
      
      const childDiv = document.createElement('div');
      childDiv.id = 'child-element';
      childSection.appendChild(childDiv);
      
      container.appendChild(parentSection);
      
      // Register parent header as collapsable
      context.registerCollapsableAnchor('parent-header', 'h3', false);
      
      // Search from child element should find parent header
      const result = context.getClosestCollapsableAnchor('child-element');
      expect(result.anchor).toBe('parent-header');
      expect(result.shouldCollapseOther).toBe(false);
    });

    it('returns null when no collapsable anchor found in hierarchy', () => {
      const container = containerRef.current!;
      
      const section = document.createElement('section');
      section.setAttribute('data-level', '3');
      
      const div = document.createElement('div');
      div.id = 'orphan';
      section.appendChild(div);
      
      container.appendChild(section);
      
      const result = context.getClosestCollapsableAnchor('orphan');
      expect(result.anchor).toBeNull();
      expect(result.shouldCollapseOther).toBe(false);
    });

    it('returns null when element is not in container', () => {
      const result = context.getClosestCollapsableAnchor('non-existent');
      expect(result.anchor).toBeNull();
      expect(result.shouldCollapseOther).toBe(false);
    });

    it('handles element without parent node', () => {
      const container = containerRef.current!;
      
      const orphanDiv = document.createElement('div');
      orphanDiv.id = 'orphan-div';
      container.appendChild(orphanDiv);
      
      const result = context.getClosestCollapsableAnchor('orphan-div');
      expect(result.anchor).toBeNull();
    });

    it('handles section with header but no id attribute', () => {
      const container = containerRef.current!;
      
      const section = document.createElement('section');
      section.setAttribute('data-level', '3');
      
      const header = document.createElement('h3');
      // No id attribute
      section.appendChild(header);
      
      const div = document.createElement('div');
      div.id = 'test-div';
      section.appendChild(div);
      
      container.appendChild(section);
      
      const result = context.getClosestCollapsableAnchor('test-div');
      expect(result.anchor).toBeNull();
    });

    it('stops searching when reaching container boundary', () => {
      const container = containerRef.current!;
      
      const section = document.createElement('section');
      section.setAttribute('data-level', '3');
      
      const div = document.createElement('div');
      div.id = 'boundary-test';
      section.appendChild(div);
      
      container.appendChild(section);
      
      const result = context.getClosestCollapsableAnchor('boundary-test');
      expect(result.anchor).toBeNull();
      expect(result.shouldCollapseOther).toBe(false);
    });
  });

  describe('constructor', () => {
    it('initializes with provided levels', () => {
      const ctx = new CollapsableContextValue(containerRef, ['h2', 'h5']);
      ctx.registerCollapsableAnchor('h2-test', 'h2', false);
      ctx.registerCollapsableAnchor('h5-test', 'h5', false);
      
      expect(ctx.getClosestCollapsableAnchor('h2-test').anchor).toBe('h2-test');
      expect(ctx.getClosestCollapsableAnchor('h5-test').anchor).toBe('h5-test');
    });

    it('initializes with empty levels array', () => {
      const ctx = new CollapsableContextValue(containerRef, []);
      ctx.registerCollapsableAnchor('test', 'h3', false);
      
      // Should not be registered because no levels are collapsable
      expect(ctx.getClosestCollapsableAnchor('test').anchor).toBeNull();
    });
  });
});
