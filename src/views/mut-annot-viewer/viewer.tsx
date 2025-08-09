import React from 'react';
import Loader from '../../components/loader';

import LegendContext from './components/legend-context';
import CanvasSequenceViewer from './components/canvas-sequence-viewer';
import ViewerController from './components/viewer-controller';
import ViewerLegend from './components/viewer-legend';
import ViewerFooter, {useFootnote} from './components/viewer-footer';
import {usePositionLookup} from './utils';
import type {Citation} from './prop-types';

import style from './style.module.scss';
import type {SeqViewerSize} from './prop-types';

interface Location {
  pathname?: string;
  query?: Record<string, any>;
}

interface Router {
  push: (loc: any) => void;
}

interface FragmentOption {
  name: string;
  seqFragment: [number, number];
}

interface AnnotationData {
  fragmentOptions: FragmentOption[];
  proteinViews: any[];
  annotCategories: any[];
  annotations: any[];
  positions: any[];
  citations: any[];
  comments: {data: any[]; references: string};
}

/**
 * Manage the current sequence fragment based on the region in the URL.
 *
 * @param region - Current region name from the URL query.
 * @param fragmentOptions - Available fragment options.
 * @param location - Router location object for updating the query string.
 * @param router - Router instance used to update the URL.
 * @returns A tuple containing the selected sequence fragment and a setter
 *   function to update it.
 */
function useSeqFragment({
  region,
  fragmentOptions,
  location,
  router
}: {
  region?: string;
  fragmentOptions: FragmentOption[];
  location: Location;
  router: Router;
}): [[number, number], (region: string) => void] {
  const defaultSeqFragment = React.useMemo<[number, number]>(
    () =>
      (
        fragmentOptions.find(({name}) => name === region) ||
        fragmentOptions[0]
      ).seqFragment,
    [fragmentOptions, region]
  );

  const [seqFragment, _setSeqFragment] = React.useState<[number, number]>(defaultSeqFragment);

  const setSeqFragment = React.useCallback(
    (reg: string) => {
      const newLoc = {
        ...location,
        query: {
          ...location.query,
          region: reg
        }
      };
      router.push(newLoc);
      const {seqFragment} = fragmentOptions.find(({name}) => name === reg)!;
      _setSeqFragment(seqFragment);
    },
    [location, router, fragmentOptions]
  );

  return [seqFragment, setSeqFragment];
}

/**
 * Maintain lookup table of selected annotation names for each category.
 *
 * @param annotCategories - Annotation categories definition.
 * @returns State tuple of current annotation name lookup and its setter.
 */
function useCurAnnotNameLookup({
  annotCategories
}: {
  annotCategories: any[];
}): [Record<string, string[]>, React.Dispatch<React.SetStateAction<Record<string, string[]>>>] {
  const defaultCurAnnotNameLookup = React.useMemo(
    () =>
      annotCategories.reduce((acc: Record<string, string[]>, cat: any) => {
        if (cat.multiSelect) {
          acc[cat.name] = cat.defaultAnnots;
        } else if (cat.defaultAnnot) {
          acc[cat.name] = [cat.defaultAnnot];
        }
        return acc;
      }, {}),
    [annotCategories]
  );
  return React.useState<Record<string, string[]>>(defaultCurAnnotNameLookup);
}

/**
 * Persist and manage the current sequence viewer size.
 *
 * @returns State tuple of the size and its setter.
 */
export function useSeqViewerSize(): [SeqViewerSize, (size: SeqViewerSize) => void] {
  const KEY_SEQVIEWER = '--sierra-seqviewer-size';
  const defaultSeqViewerSize = React.useMemo<SeqViewerSize>(() => {
    let size = window.localStorage.getItem(KEY_SEQVIEWER) as SeqViewerSize | null;
    if (!['large', 'middle', 'small'].includes(size ?? '')) {
      size = 'middle';
    }
    return size as SeqViewerSize;
  }, []);

  const saveSeqViewerSize = React.useCallback((size: SeqViewerSize) => {
    window.localStorage.setItem(KEY_SEQVIEWER, size);
  }, []);

  const [seqViewerSize, _setSeqViewerSize] = React.useState<SeqViewerSize>(defaultSeqViewerSize);
  const setSeqViewerSize = React.useCallback(
    (size: SeqViewerSize) => {
      _setSeqViewerSize(size);
      saveSeqViewerSize(size);
    },
    [saveSeqViewerSize]
  );

  return [seqViewerSize, setSeqViewerSize];
}

interface MutAnnotViewerInnerProps {
  location: Location;
  router: Router;
  region?: string;
  refSeq: string;
  refDataLoader?: () => Promise<any>;
  annotationData: AnnotationData;
}

/**
 * Render the inner mutation annotation viewer once data has been loaded.
 */
function MutAnnotViewerInner({
  location,
  router,
  region,
  refSeq,
  refDataLoader,
  annotationData: {
    fragmentOptions,
    proteinViews,
    annotCategories,
    annotations,
    positions,
    citations,
    comments
  }
}: MutAnnotViewerInnerProps) {
  const [seqFragment, setSeqFragment] = useSeqFragment({
    region,
    fragmentOptions,
    location,
    router
  });

  const [curAnnotNameLookup, setCurAnnotNameLookup] = useCurAnnotNameLookup({
    annotCategories
  });

  const positionLookup = usePositionLookup(positions);
  const commentLookup = usePositionLookup(comments.data);

  const [seqViewerSize, setSeqViewerSize] = useSeqViewerSize();

  const [selectedPositions, setSelectedPositions] = React.useState<number[]>([]);

  const citationLookup = React.useMemo(
    () => citations.reduce(
      (acc, c) => ({
        ...acc,
        [`${c.citationId}.${c.sectionId}`]: c
      }),
      {} as Record<string, Citation>
    ),
    [citations]
  );

  const [footnote, hasFootnote, showFootnote, openFn, closeFn] = useFootnote({
    selectedPositions,
    commentLookup,
    commentReferences: comments.references
  });

  return (
    <LegendContext>
      <section className={style.viewer}>
        <div className={style['controller-container']}>
          <ViewerController
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
            }}
          />
        </div>
        <CanvasSequenceViewer
          size={seqViewerSize}
          sequence={refSeq}
          onChange={setSelectedPositions}
          noBlurSelector={`*[role="tooltip"], *[data-no-blur]`}
          className={style.seqviewer}
          {
            ...{
              seqFragment,
              annotCategories,
              curAnnotNameLookup,
              annotations,
              positionLookup,
              selectedPositions
            }
          }
        />
        <div className={style['legend-container']}>
          <ViewerLegend
            className={style['legend']}
            {
              ...{
                seqFragment,
                annotCategories,
                curAnnotNameLookup,
                annotations,
                positionLookup,
                citations: citationLookup
              }
            }
          />
        </div>
      </section>
      {showFootnote ? (
        <ViewerFooter
          sequence={refSeq}
          refDataLoader={refDataLoader}
          selectedPositions={selectedPositions}
          proteinViews={proteinViews}
          onClose={closeFn}
        >
          {footnote}
        </ViewerFooter>
      ) : null}
    </LegendContext>
  );
}

interface Preset {
  name: string;
  display: React.ReactNode;
  annotationLoader: () => Promise<{refSequence: string} & AnnotationData>;
}

interface MutAnnotViewerProps {
  preset: Preset;
  refDataLoader?: () => Promise<any>;
  match: {location: Location};
  router: Router;
}

/**
 * Top-level mutation annotation viewer component which loads data using the
 * preset's annotation loader.
 */
export default function MutAnnotViewer({
  preset: {name, display, annotationLoader},
  refDataLoader,
  match: {location},
  router
}: MutAnnotViewerProps) {
  const [childProps, setChildProps] = React.useState<{
    name: string;
    display: React.ReactNode;
    refSeq: string;
    annotationData: AnnotationData;
    refDataLoader?: () => Promise<any>;
    location: Location;
    router: Router;
    region?: string;
  }>();

  React.useEffect(() => {
    let mounted = true;
    annotationLoader().then(({refSequence, ...annotationData}) => {
      if (mounted) {
        setChildProps({
          name,
          display,
          refSeq: refSequence,
          annotationData: annotationData as AnnotationData,
          refDataLoader,
          location,
          router,
          region: location?.query?.region
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [annotationLoader, name, display, location, router, refDataLoader]);

  return <>{childProps ? <MutAnnotViewerInner {...childProps} /> : <Loader />}</>;
}
