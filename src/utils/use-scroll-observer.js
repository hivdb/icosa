import React from 'react';
import orderBy from 'lodash/orderBy';

const DOWN = 'asc';
const UP = 'desc';

function inView(node) {
  let {top, bottom} = node.getBoundingClientRect();
  return bottom >= 0 && top <= window.innerHeight;
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

  const self = React.useRef({
    observingNodes: {},
    previousYs: {},
    previousRatios: {}
  });
  self.current.name = currentSelected.name;
  self.current.loaded = loaded;

  const preventScrollObserver = React.useCallback(
    () => {
      self.current.preventObserver = true;
    },
    []
  );

  const resetScrollObserver = React.useCallback(
    () => {
      self.current.preventObserver = false;
      self.current.prevRatioMap = {};
      self.current.candidateMap = {};
    },
    []
  );

  const getNodeAndDirection = React.useCallback(
    ({
      boundingClientRect: {y: currentY},
      intersectionRatio: currentRatio,
      isIntersecting,
      target: {
        dataset: {
          scrollObserveIndex: index,
          scrollObserveName: name
        }
      }
    }) => {
      // see https://stackoverflow.com/a/51976805
      const previousY = self.current.previousYs[name] || 0;
      const previousRatio = self.current.previousRatios[name] || 0;
      let direction = null;
      if (currentRatio > previousRatio && isIntersecting) {
        if (currentY < previousY) {
          direction = DOWN;
        }
        else if (currentY > previousY) {
          direction = UP;
        }
      }
      self.current.previousYs[name] = currentY;
      self.current.previousRatios[name] = currentRatio;
      return {
        node: self.current.observingNodes[name],
        direction,
        name,
        index
      };
    },
    []
  );

  const observerCallback = React.useCallback(
    async entries => {
      if (
        disabled ||
        !self.current.loaded ||
        self.current.preventObserver
      ) {
        return;
      }

      let observedNodes = entries
        .map(getNodeAndDirection)
        .filter(({direction}) => !!direction);
      const {direction} = (observedNodes[0] || {});
      if (!direction) {
        return;
      }
      observedNodes = orderBy(observedNodes, ['index'], [direction]);

      for (const {node, name} of observedNodes) {
        await asyncLoadNewItem(name, /* updateCurrentSelected = */true);
        node.dataset.scrollObserveLoaded = 'yes';
        break;
      }
      afterLoadNewItem();
    },
    [getNodeAndDirection, asyncLoadNewItem, afterLoadNewItem, disabled]
  );

  const registerScrollObserver = React.useCallback(
    () => {
      const options = {
        root: document,
        rootMargin: '-50% 0px -25% 0px',
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
      };
      if (self.current.observer) {
        self.current.observer.disconnect();
      }
      self.current.observer =
        new IntersectionObserver(observerCallback, options);
      for (const node of Object.values(self.current.observingNodes)) {
        // re-register all known nodes
        self.current.observer.observe(node);
      }
      resetScrollObserver();
    },
    [observerCallback, resetScrollObserver]
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
    async (
      name,
      callback = () => null,
      avoidLoading = false,
      forceScroll = false
    ) => {
      const node = self.current.observingNodes[name];
      if (node) {
        if (!forceScroll && inView(node)) {
          callback();
          return;
        }

        preventScrollObserver();
        let {top} = node.getBoundingClientRect();
        top += window.pageYOffset - 150;

        noSmoothScrollTo(top);

        if (!avoidLoading) {
          await asyncLoadNewItem(name, /* updateCurrentSelected = */ true);
          node.dataset.scrollObserveLoaded = "yes";
          afterLoadNewItem();
        }

        top = node.getBoundingClientRect().top;
        top += window.pageYOffset - 150;

        noSmoothScrollTo(top);
        resetScrollObserver();
      }
    },
    [
      preventScrollObserver,
      resetScrollObserver,
      asyncLoadNewItem,
      afterLoadNewItem
    ]
  );

  const onObserve = React.useCallback(
    ({name, index, node}) => {
      node.dataset.scrollObserveName = name;
      node.dataset.scrollObserveIndex = index;
      self.current.observingNodes[name] = node;
      if (self.current.observer) {
        self.current.observer.observe(node);
      }
    },
    []
  );

  const onDisconnect = React.useCallback(
    ({node}) => {
      const name = node.dataset.scrollObserveName;
      delete self.current.observingNodes[name];
    },
    []
  );

  // only run once on componentDidMount
  React.useEffect(
    () => {
      if (!disabled) {
        scrollTo(
          self.current.name,
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
