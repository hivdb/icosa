import React from 'react';


function ensureScrollTo(top, callback, smoothMaxDelta = 0) {
  const enableSmooth = Math.abs(top - window.pageYOffset) < smoothMaxDelta;
  const checkScroll = () => {
    if (Math.abs(window.pageYOffset - top) < 15) {
      window.removeEventListener('scroll', checkScroll, false);
      document.documentElement.dataset.noSmoothScroll = '';
      setTimeout(() => {
        window.scrollTo({top, behavior: 'auto'});
        callback && setTimeout(callback, 500);
      }, 50);
      delete document.documentElement.dataset.noSmoothScroll;
    }
  };
  window.addEventListener('scroll', checkScroll, false);
  let behavior = 'auto';
  if (enableSmooth) {
    behavior = 'smooth';
  }
  else {
    // disable global smooth scroll
    document.documentElement.dataset.noSmoothScroll = '';
  }
  window.scrollTo({top, behavior});
}


export default function useScrollObserver({
  loaded,
  output,
  currentSelected,
  onSelectItem
}) {

  const {current} = React.useRef({
    observingNodes: {}
  });
  current.loaded = loaded;
  current.name = currentSelected.name;
  current.output = output;

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
      if (!current.loaded || current.preventObserver) {
        return;
      }
      for (const entry of entries) {
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
          curRatio > 0.9
        ) {
          // enter
          current.candidateMap[index] = name;
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
        const [[,newName]] = candidates;
        if (newName !== current.name) {
          await onSelectItem(candidates[0][1]);
          current.name = newName;
        }
      }
    },
    [
      current,
      onSelectItem
    ]
  );

  const registerScrollObserver = React.useCallback(
    () => {
      const options = {
        root: document,
        rootMargin: '-50px 0px -30% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
      };
      current.observer = new IntersectionObserver(observerCallback, options);
      resetScrollObserver();
    },
    [current, observerCallback, resetScrollObserver]
  );

  const unregisterScrollObserver = React.useCallback(
    () => current.observer.disconnect(),
    [current]
  );

  React.useEffect(
    () => {
      if (output === 'printable') {
        return;
      }
      registerScrollObserver();
      return unregisterScrollObserver();
    },
    [
      output, current,
      registerScrollObserver,
      unregisterScrollObserver
    ]
  );

  const onObserve = React.useCallback(
    ({name, index, node}) => {
      node.dataset.scrollObserveName = name;
      node.dataset.scrollObserveIndex = index;
      current.observer.observe(node);
      current.observingNodes[name] = node;
    },
    [current]
  );

  const onDisconnect = React.useCallback(
    ({node}) => {
      const name = node.dataset.scrollObserveName;
      delete current.observingNodes[name];
      current.observer.disconnect(node);
    },
    [current]
  );

  const preventScrollObserver = React.useCallback(
    () => {
      current.preventObserver = true;
    },
    [current]
  );

  const scrollTo = React.useCallback(
    (name, callback = () => null) => {
      const node = current.observingNodes[name];
      if (node) {
        let {top, bottom} = node.getBoundingClientRect();

        if (top >= 0 && bottom - (bottom - top) * .9 <= window.innerHeight) {
          // in viewport
          callback();
          return;
        }

        top += window.pageYOffset - 150;
        ensureScrollTo(top, callback);
      }
    },
    [current]
  );

  React.useEffect(
    () => {
      if (output === 'printable') {
        return;
      }
      if (loaded) {
        scrollTo(current.name);
      }
    },
    [loaded, output, current, scrollTo]
  );

  return {
    onObserve,
    onDisconnect,
    preventScrollObserver,
    resetScrollObserver,
    scrollTo
  };
}
