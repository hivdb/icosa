import React from 'react';

import type {ClosestAnchorResult} from './types';

/**
 * Runtime context used by the Collapsable components.
 */
export class CollapsableContextValue {
  #containerRef: React.RefObject<HTMLDivElement | null>;
  #collapsableLevels: string[];
  #collapsableAnchors: Record<string, boolean>;

  constructor(
    containerRef: React.RefObject<HTMLDivElement | null>,
    levels: string[]
  ) {
    this.#containerRef = containerRef;
    this.#collapsableLevels = levels;
    this.#collapsableAnchors = {};
  }

  /**
   * Register an anchor that can be collapsed.
   */
  registerCollapsableAnchor = (
    anchor: string | null,
    level: string,
    alwaysCollapsable?: boolean
  ) => {
    if (anchor === null) {
      return;
    }
    if (!alwaysCollapsable && !this.#collapsableLevels.includes(level)) {
      return;
    }
    if (this.#collapsableAnchors[anchor]) {
      return;
    }
    this.#collapsableAnchors[anchor] = true;
  };

  #isAnchorCollapsable = (anchor: string | null) => {
    if (anchor === null) {
      return false;
    }
    return anchor in this.#collapsableAnchors;
  };

  /**
   * Determine which anchor should currently be expanded based on the URL
   * hash.
   */
  getClosestCollapsableAnchor = (curHash: string | null): ClosestAnchorResult => {
    if (!curHash) {
      return {
        anchor: null,
        shouldCollapseOther: false
      };
    }
    if (this.#isAnchorCollapsable(curHash)) {
      return {
        anchor: curHash,
        shouldCollapseOther: true
      };
    }
    const container = this.#containerRef.current;
    if (container) {
      let elem: HTMLElement | null = container.querySelector(
        `[id=${JSON.stringify(curHash)}]`
      );
      while (elem && container.contains(elem)) {
        const header = elem.querySelector('h1,h2,h3,h4,h5,h6');
        if (header && (header as HTMLElement).id) {
          const anchor = (header as HTMLElement).id;
          if (this.#isAnchorCollapsable(anchor)) {
            return {
              anchor,
              shouldCollapseOther: false
            };
          }
        }
        if (!elem.parentNode) {
          break;
        }
        elem = (elem.parentNode as HTMLElement).closest('section[data-level]');
      }
    }
    return {
      anchor: null,
      shouldCollapseOther: false
    };
  };
}

/**
 * Default empty context value for Collapsable.
 * Components should always be wrapped in a Collapsable.Provider.
 */
const defaultContextValue: CollapsableContextValue = new CollapsableContextValue(
  React.createRef<HTMLDivElement>(),
  []
);

export default React.createContext<CollapsableContextValue>(defaultContextValue);
