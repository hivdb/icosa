import React from 'react';

export class CollapsableContextValue {
  #containerRef; // private
  #collapsableLevels; // private
  #collapsableAnchors; // private

  constructor(
    containerRef, // React ref to article container
    levels // levels (from h1 to h6) that can be collapsed
  ) {
    this.#containerRef = containerRef;
    this.#collapsableLevels = levels;
    this.#collapsableAnchors = {};
  }

  registerCollapsableAnchor = (
    // name of anchor to be registered
    anchor,

    // level of the section (from h1 to h6)
    level,

    // should ignoring the level config and
    // allow the section always be collapsable?
    alwaysCollapsable
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

  #isAnchorCollapsable = (anchor) => {
    if (anchor === null) {
      return false;
    }
    return anchor in this.#collapsableAnchors;
  };

  getClosestCollapsableAnchor = curHash => {
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
      let elem = container.querySelector(`[id=${JSON.stringify(curHash)}]`);
      while (elem && container.contains(elem)) {
        const header = elem.querySelector('h1,h2,h3,h4,h5,h6');
        if (header && header.attributes.id) {
          const anchor = header.attributes.id.value;
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
        elem = elem.parentNode.closest('section[data-level]');
      }
    }
    return {
      anchor: null,
      shouldCollapseOther: false
    };
  };

}


export default React.createContext({});
