import React from 'react';


function inView(node) {
  let {top, bottom} = node.getBoundingClientRect();
  return top >= 0 && bottom <= window.innerHeight;
}


function noSmoothScrollTo(top) {
  let behavior = 'auto';
  // disable global smooth scroll
  document.documentElement.dataset.noSmoothScroll = '';
  window.scrollTo({top, behavior});
}


export default function useScrollObserver({
  loaded,
  disabled,
  currentSelected,
  asyncLoadNewItem,
  afterLoadNewItem
}) {

  const {current} = React.useRef({
    observingNodes: {}
  });
  current.name = currentSelected.name;
  current.loaded = loaded;

  const preventScrollObserver = React.useCallback(
    () => {
      current.preventObserver = true;
    },
    [current]
  );

  const resetScrollObserver = React.useCallback(
    () => {
      current.preventObserver = false;
      current.prevRatioMap = {};
      current.candidateMap = {};
    },
    [current]
  );

  const observerCallback = React.useCallback(
    async (entries) => {
      if (!current.loaded || disabled || current.preventObserver) {
        return;
      }
      /*for (const entry of entries) {
        const name = entry.target.dataset.scrollObserveName;
        const index = parseInt(entry.target.dataset.scrollObserveIndex);
        const viewportHeight = window.innerHeight;
        const curRatio = Math.max(
          entry.intersectionRatio,
          entry.intersectionRect.height / viewportHeight
        );
        const isIntersecting = entry.isIntersecting;
        const prevRatio = current.prevRatioMap[name] || 0;

        if (
          isIntersecting &&
          curRatio > prevRatio &&
          curRatio > 0.5
        ) {
          // enter
          current.candidateMap[index] = [name, entry.target];
        }
        else if (
          curRatio < prevRatio &&
          curRatio < 0.5
        ) {
          // leave
          delete current.candidateMap[index];
        }
        current.prevRatioMap[name] = curRatio;
      }
      const candidates = Object.entries(current.candidateMap);
      if (candidates.length > 0) {
        candidates.sort(([a], [b]) => a - b);
        const [[, [targetName, target]]] = candidates;
        if (targetName !== current.name) {
          await asyncLoadNewItem(
            targetName, /* updateCurrentSelected = / true
          );
          target.dataset.scrollObserveLoaded = "yes";
          anyLoaded = true;
        }
      }*/

      let anyLoaded = false;
      let firstFlag = true;
      const observingNodes = Object.entries(current.observingNodes);
      /* observingNodes.sort(([,a], [,b]) => (
        parseInt(a.dataset.scrollObserveIndex) -
        parseInt(b.dataset.scrollObserveIndex)
      )); */
      for (const [name, node] of observingNodes) {
        if (inView(node)) {
          if (firstFlag && name !== current.name) {
            await asyncLoadNewItem(name, /* updateCurrentSelected = */ true);
            node.dataset.scrollObserveLoaded = "yes";
            firstFlag = false;
            anyLoaded = true;
          }
          else if (node.dataset.scrollObserveLoaded !== "yes") {
            await asyncLoadNewItem(name, /* updateCurrentSelected = */ false);
            node.dataset.scrollObserveLoaded = "yes";
            anyLoaded = true;
          }
        }
      }
      anyLoaded && afterLoadNewItem();
    },
    [asyncLoadNewItem, afterLoadNewItem, current, disabled]
  );

  const registerScrollObserver = React.useCallback(
    () => {
      const options = {
        root: document,
        rootMargin: '-50px 0px -30% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
      };
      if (current.observer) {
        current.observer.disconnect();
      }
      current.observer = new IntersectionObserver(observerCallback, options);
      for (const node of Object.values(current.observingNodes)) {
        // re-register all known nodes
        current.observer.observe(node);
      }
      resetScrollObserver();
    },
    [current, observerCallback, resetScrollObserver]
  );

  React.useEffect(
    () => {
      if (disabled) {
        return;
      }
      registerScrollObserver();
    },
    [
      disabled,
      registerScrollObserver
    ]
  );

  const scrollTo = React.useCallback(
    async (name, callback = () => null, avoidLoading = false) => {
      const node = current.observingNodes[name];
      if (node) {
        if (inView(node)) {
          callback();
          return;
        }

        preventScrollObserver();
        if (!avoidLoading) {
          await asyncLoadNewItem(name, /* updateCurrentSelected = */ true);
          node.dataset.scrollObserveLoaded = "yes";
          afterLoadNewItem();
        }

        let {top} = node.getBoundingClientRect();
        top += window.pageYOffset - 150;

        noSmoothScrollTo(top);
        resetScrollObserver();
      }
    },
    [
      current, preventScrollObserver, resetScrollObserver,
      asyncLoadNewItem, afterLoadNewItem
    ]
  );

  const onObserve = React.useCallback(
    ({name, index, node}) => {
      node.dataset.scrollObserveName = name;
      node.dataset.scrollObserveIndex = index;
      current.observingNodes[name] = node;
      if (current.observer) {
        current.observer.observe(node);
      }
    },
    [current]
  );

  const onDisconnect = React.useCallback(
    ({node}) => {
      const name = node.dataset.scrollObserveName;
      delete current.observingNodes[name];
    },
    [current]
  );

  // only run once on componentDidMount
  React.useEffect(
    () => {
      if (!disabled) {
        scrollTo(
          current.name,
          () => null,
          /* avoidLoading = */ true
        );
      }
    },
    [/* eslint-disable-line react-hooks/exhaustive-deps */]
  );

  return {
    onObserve,
    onDisconnect,
    // preventScrollObserver,
    // resetScrollObserver,
    scrollTo
  };
}
