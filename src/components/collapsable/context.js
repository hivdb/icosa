import React from 'react';

export class CollapsableContextValue {
  #collapsableAnchors;  // private
  #containerRef;  // private

  constructor() {
    this.#collapsableAnchors = {};
  }

  registerCollapsableAnchor = (anchor) => {
    if (anchor === null) {
      return;
    }
    if (this.#collapsableAnchors[anchor]) {
      return;
    }
    this.#collapsableAnchors[anchor] = true;
  }

  #isAnchorCollapsable = (anchor) => {
    if (anchor === null) {
      return false;
    }
    return anchor in this.#collapsableAnchors;
  }

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
  }

  setContainerRef = (ref) => {
    this.#containerRef = ref;
  }

}


export default React.createContext({});
