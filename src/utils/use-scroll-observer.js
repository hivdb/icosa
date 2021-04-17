import React from 'react';


function inView(node) {
  let {top, bottom} = node.getBoundingClientRect();
  return top >= 0 && bottom <= window.innerHeight;
}


function ensureScrollTo(top, callback) {
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
  // disable global smooth scroll
  document.documentElement.dataset.noSmoothScroll = '';
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
  current.onSelectItem = onSelectItem;

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
          curRatio > 0.5
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
          await current.onSelectItem(candidates[0][1]);
          current.name = newName;
        }
      }
    },
    [
      current
    ]
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
        current.observer.observe(node);
      }
      resetScrollObserver();
    },
    [current, observerCallback, resetScrollObserver]
  );

  React.useEffect(
    () => {
      if (output === 'printable') {
        return;
      }
      registerScrollObserver();
    },
    [
      output, current,
      registerScrollObserver
    ]
  );

  const scrollTo = React.useCallback(
    (name, callback = () => null) => {
      const node = current.observingNodes[name];
      if (node) {
        if (inView(node)) {
          callback();
          return;
        }
        let {top} = node.getBoundingClientRect();

        top += window.pageYOffset - 150;
        ensureScrollTo(top, callback);
      }
    },
    [current]
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

  const preventScrollObserver = React.useCallback(
    () => {
      current.preventObserver = true;
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
