import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import Loader from '../../components/loader';

import LegendContext from './components/legend-context';
import CanvasSequenceViewer from './components/canvas-sequence-viewer';
import ViewerController from './components/viewer-controller';
import ViewerLegend from './components/viewer-legend';
import ViewerFooter, {useFootnote} from './components/viewer-footer';
import {usePositionLookup} from './utils';

import style from './style.module.scss';

function useSeqFragment({
  region,
  fragmentOptions,
  location,
  router
}) {
  const defaultSeqFragment = React.useMemo(
    () => (
      fragmentOptions.find(
        ({name}) => name === region
      ) || fragmentOptions[0]
    ).seqFragment,
    [fragmentOptions, region]
  );

  const [
    seqFragment,
    _setSeqFragment
  ] = React.useState(defaultSeqFragment);

  const setSeqFragment = React.useCallback(
    region => {
      const newLoc = {
        ...location,
        query: {
          ...location.query,
          region
        }
      };
      router.push(newLoc);
      const {seqFragment} = fragmentOptions.find(({name}) => name === region);
      _setSeqFragment(seqFragment);
    },
    [location, router, fragmentOptions]
  );

  return [seqFragment, setSeqFragment];
}


function useCurAnnotNameLookup({
  annotCategories
}) {
  const defaultCurAnnotNameLookup = React.useMemo(
    () => annotCategories.reduce((acc, cat) => {
      if (cat.multiSelect) {
        acc[cat.name] = cat.defaultAnnots;
      }
      else if (cat.defaultAnnot) {
        acc[cat.name] = [cat.defaultAnnot];
      }
      return acc;
    }, {}),
    [annotCategories]
  );
  return React.useState(defaultCurAnnotNameLookup);
}


function useSeqViewerSize() {
  const KEY_SEQVIEWER = '--sierra-seqviewer-size';
  const defaultSeqViewerSize = React.useMemo(
    () => {
      let size = window.localStorage.getItem(KEY_SEQVIEWER);
      if (!['large', 'middle', 'small'].includes(size)) {
        size = 'middle';
      }
      return size;
    },
    []
  );

  const saveSeqViewerSize = React.useCallback(
    size => window.localStorage.setItem(KEY_SEQVIEWER, size),
    []
  );

  const [
    seqViewerSize,
    _setSeqViewerSize
  ] = React.useState(defaultSeqViewerSize);
  const setSeqViewerSize = React.useCallback(
    seqViewerSize => {
      _setSeqViewerSize(seqViewerSize);
      saveSeqViewerSize(seqViewerSize);
    },
    [saveSeqViewerSize]
  );

  return [seqViewerSize, setSeqViewerSize];
}


MutAnnotViewerInner.propTypes = {
  location: PropTypes.object.isRequired,
  router: routerShape.isRequired,
  region: PropTypes.string,
  refSeq: PropTypes.string.isRequired,
  refDataLoader: PropTypes.func,
  annotationData: PropTypes.object.isRequired
};

function MutAnnotViewerInner({
  location,
  router,
  region,
  refSeq,
  refDataLoader,
  annotationData: {
    fragmentOptions,
    annotCategories,
    annotations,
    positions,
    citations,
    comments
  }
}) {
  const [seqFragment, setSeqFragment] = useSeqFragment({
    region,
    fragmentOptions,
    location,
    router
  });

  const [
    curAnnotNameLookup,
    setCurAnnotNameLookup
  ] = useCurAnnotNameLookup({annotCategories});

  const positionLookup = usePositionLookup(positions);
  const commentLookup = usePositionLookup(comments.data);

  const [seqViewerSize, setSeqViewerSize] = useSeqViewerSize();

  const [
    selectedPositions,
    setSelectedPositions
  ] = React.useState([]);

  const [footnote, hasFootnote, showFootnote, openFn, closeFn] = useFootnote({
    selectedPositions,
    commentLookup,
    commentReferences: comments.references
  });

  return <LegendContext>
    <section className={style.viewer}>
      <div className={style['controller-container']}>
        <ViewerController
         sequence={refSeq}
         hasFootnote={hasFootnote}
         onSeqViewerSizeChange={setSeqViewerSize}
         onSeqFragmentChange={setSeqFragment}
         onCurAnnotNameLookupChange={setCurAnnotNameLookup}
         onOpenFootnote={openFn}
         className={style['controller']}
         {...{
           seqFragment,
           fragmentOptions,
           annotCategories,
           curAnnotNameLookup,
           annotations,
           seqViewerSize
         }} />
      </div>
      <CanvasSequenceViewer
       size={seqViewerSize}
       sequence={refSeq}
       onChange={setSelectedPositions}
       noBlurSelector={`*[role="tooltip"], *[data-no-blur]`}
       className={style.seqviewer}
       {...{
         seqFragment,
         annotCategories,
         curAnnotNameLookup,
         annotations,
         positionLookup,
         citations,
         selectedPositions
       }} />
      <div className={style['legend-container']}>
        <ViewerLegend
         sequence={refSeq}
         className={style['legend']}
         {...{
           seqFragment,
           annotCategories,
           curAnnotNameLookup,
           annotations,
           positionLookup,
           citations,
           selectedPositions
         }} />
      </div>
    </section>
    {showFootnote ?
      <ViewerFooter
       refDataLoader={refDataLoader}
       onClose={closeFn}>
        {footnote}
      </ViewerFooter> : null}
  </LegendContext>;

}


MutAnnotViewer.propTypes = {
  preset: PropTypes.shape({
    name: PropTypes.string.isRequired,
    display: PropTypes.node.isRequired,
    annotationLoader: PropTypes.func.isRequired
  }).isRequired,
  refDataLoader: PropTypes.func,
  match: matchShape.isRequired,
  router: routerShape.isRequired
};

export default function MutAnnotViewer({
  preset: {
    name,
    display,
    annotationLoader
  },
  refDataLoader,
  match: {location},
  router
}) {
  const [childProps, setChildProps] = React.useState();

  React.useEffect(
    () => {
      let mounted = true;
      annotationLoader().then(
        ({refSequence, ...annotationData}) => mounted && setChildProps({
          name,
          display,
          refSeq: refSequence,
          annotationData,
          refDataLoader,
          location,
          router,
          region: location?.query?.region
        })
      );
      return () => mounted = false;
    },
    [annotationLoader, name, display, location, router, refDataLoader]
  );

  return <>
    {childProps ? <MutAnnotViewerInner {...childProps} /> : <Loader />}
  </>;
}
