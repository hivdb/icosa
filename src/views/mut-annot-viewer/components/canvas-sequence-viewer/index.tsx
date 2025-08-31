import React from 'react';
import makeClassNames from 'classnames';
import debounce from 'lodash/debounce';
import Loader from '../../../../components/loader';

import style from './style.module.scss';
import ConfigGenerator, {preloadFonts} from './config-generator';
import SeqViewerStage from './stage';

import {
  getAnnotPositions,
  calcUnderscoreAnnotLocations
} from './funcs';

import LegendContext, {type LegendContextValue} from '../legend-context';

import type {
  CurAnnotNameLookup,
  AnnotCategory,
  Position,
  SeqViewerSize,
  Annotation
} from '../../types';


/**
 * Hook providing a ref to the container element and tracking its width.
 */
function useContainer(): [React.RefObject<HTMLDivElement | null>, number | null] {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const onWindowResize = debounce(() => {
      const konva = containerRef.current?.querySelector('.konvajs-content') as HTMLElement | null;
      if (konva) {
        konva.style.display = 'none';
      }
      preloadFonts()
        .then(() => (
          mounted &&
          setContainerWidth(containerRef.current?.clientWidth ?? null)
        ))
        .finally(() => {
          if (konva) {
            konva.style.display = '';
          }
        });
    }, 200);
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
    return () => {
      window.removeEventListener('resize', onWindowResize, false);
      mounted = false;
    };
  }, []);
  return [containerRef, containerWidth];
}


/**
 * Build and memoize the rendering configuration for the viewer.
 */
function useConfig({
  size,
  sequence,
  seqFragment,
  annotations,
  positionLookup,
  curAnnotNameLookup,
  annotCategories,
  containerWidth,
  legendContext
}: {
  size: SeqViewerSize;
  sequence: string;
  seqFragment: [number, number];
  annotations: Annotation[];
  positionLookup: Record<number, Position>;
  curAnnotNameLookup: CurAnnotNameLookup;
  annotCategories: AnnotCategory[];
  containerWidth: number | null;
  legendContext: LegendContextValue;
}) {
  const config = React.useMemo(
      () => {
        let colorBoxPositions: Record<number, unknown> = {};
        let circleInBoxPositions: Record<number, unknown> = {};
        let underscoreAnnotLocations: {locations: any[]; matrix: any[]} = {
          locations: [],
          matrix: []
        };
        let underscoreAnnotNames: string[] = [];
        const aminoAcidsAnnotPositions: Record<number, unknown>[] = [];
        const aminoAcidsCatNames: string[] = [];
        const aminoAcidsOverrideColors: string[] = [];
      let aaAnnotIdx = 0;
      for (const cat of annotCategories) {
        const {name: catName, annotStyle} = cat;
        const curAnnotNames: string[] = curAnnotNameLookup[catName] || [];
        const curAnnots = annotations.filter(
          ({name}) => curAnnotNames.includes(name)
        );
        switch (annotStyle) {
          case 'colorBox':
            colorBoxPositions = getAnnotPositions(curAnnots, positionLookup);
            break;
          case 'circleInBox':
            circleInBoxPositions = getAnnotPositions(curAnnots, positionLookup);
            break;
          case 'underscore':
            underscoreAnnotLocations = calcUnderscoreAnnotLocations(
              positionLookup,
              annotations.filter(({name}) => curAnnotNames.includes(name)),
              sequence.length
            );
            underscoreAnnotNames = [...curAnnotNames];
            break;
          case 'aminoAcids':
            aminoAcidsAnnotPositions[aaAnnotIdx] = getAnnotPositions(
              curAnnots,
              positionLookup,
              aaAnnotIdx ++
            );
            aminoAcidsCatNames.push(catName);
              aminoAcidsOverrideColors.push(cat.color ?? '');
            break;
          default:
            break;
        }
      }

      if (containerWidth) {
        return new ConfigGenerator({
          sizeName: size,
          seqFragment,
          canvasWidthPixel: containerWidth,
            colorBoxPositions,
            circleInBoxPositions,
            underscoreAnnotLocations,
          underscoreAnnotNames,
          aminoAcidsAnnotPositions,
          aminoAcidsCatNames,
          aminoAcidsOverrideColors
        });
      }
      return null;
    },
    [
      size,
      sequence,
      seqFragment,
      annotations,
      positionLookup,
      curAnnotNameLookup,
      annotCategories,
      containerWidth
    ]
  );
  const {onUpdate} = legendContext;

  React.useEffect(
    () => {
      const update = config?.updateLegendContext;
        if (update) {
          update({onUpdate: onUpdate as any});
        }
    },
    [config?.updateLegendContext, onUpdate]
  );

  return config;
}


interface CanvasSequenceViewerProps {
  size: SeqViewerSize;
  className?: string;
  annotations?: Annotation[];
  seqFragment: [number, number];
  curAnnotNameLookup: CurAnnotNameLookup;
  annotCategories: AnnotCategory[];
  sequence: string;
  positionLookup: Record<number, Position>;
  selectedPositions: number[];
  noBlurSelector: string;
  onChange: (positions: number[]) => void;
}

/**
 * Root component orchestrating the canvas sequence viewer.
 */
export default function CanvasSequenceViewer({
  size,
  className,
  annotations = [],
  seqFragment,
  curAnnotNameLookup,
  annotCategories,
  sequence,
  positionLookup,
  selectedPositions,
  noBlurSelector,
  onChange
}: CanvasSequenceViewerProps) {

  const [containerRef, containerWidth] = useContainer();

  const legendContext = React.useContext(LegendContext.ContextObj);

  const config = useConfig({
    size,
    sequence,
    seqFragment,
    annotations,
    positionLookup,
    curAnnotNameLookup,
    annotCategories,
    containerWidth,
    legendContext
  });

  const combinedClassName = makeClassNames(
    style['canvas-sequence-viewer'],
    className
  );

  return (
    <div
     ref={containerRef}
     className={combinedClassName}>
      {config === null ? <Loader /> : (
        <SeqViewerStage
         {...{
           config,
           sequence,
           annotCategories,
           noBlurSelector,
           positionLookup,
           selectedPositions,
           onChange
         }} />
      )}
    </div>
  );

}
