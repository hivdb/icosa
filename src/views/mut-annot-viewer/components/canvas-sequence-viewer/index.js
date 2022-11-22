import React from 'react';
import PropTypes from 'prop-types';
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

import LegendContext from '../legend-context';

import {
  curAnnotNameLookupShape,
  annotCategoryShape,
  posShape, seqViewerSizeType
} from '../../prop-types';


function useForceUpdateOnResize() {
  const [, forceUpdate] = React.useReducer(n => n + 1, 0);
  React.useEffect(
    () => {
      const onWindowResize = debounce(() => {
        forceUpdate();
      }, 200);
      window.addEventListener('resize', onWindowResize, false);
      return window.removeEventListener('resize', onWindowResize, false);
    },
    []
  );
}

function useContainer() {
  const containerRef = React.useRef();
  const [containerWidth, setContainerWidth] = React.useState(null);

  React.useEffect(
    () => {
      let mounted = true;
      const konva = containerRef.current.querySelector('.konvajs-content');
      try {
        if (konva) {
          konva.style.display = 'none';
        }
        preloadFonts().then(() => (
          mounted &&
          setContainerWidth(containerRef.current.clientWidth)
        ));
        return () => mounted = false;
      }
      finally {
        if (konva) {
          konva.style.display = null;
        }
      }
    },
    []
  );
  return [containerRef, containerWidth];
}


function useConfig({
  size,
  sequence,
  seqFragment,
  annotations,
  positionLookup,
  curAnnotNameLookup,
  annotCategories,
  containerWidth
}) {
  return React.useMemo(
    () => {
      let colorBoxPositions = [];
      let circleInBoxPositions = [];
      let underscoreAnnotLocations = [];
      let underscoreAnnotNames = [];
      const aminoAcidsAnnotPositions = [];
      const aminoAcidsCatNames = [];
      const aminoAcidsOverrideColors = [];
      let aaAnnotIdx = 0;
      for (const cat of annotCategories) {
        const {name: catName, annotStyle} = cat;
        const curAnnotNames = curAnnotNameLookup[catName] || [];
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
            aminoAcidsOverrideColors.push(cat.color);
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
          seqLength: sequence.length,
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

}


CanvasSequenceViewer.propTypes = {
  size: seqViewerSizeType.isRequired,
  className: PropTypes.string,
  annotations: PropTypes.array,
  seqFragment: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  curAnnotNameLookup: curAnnotNameLookupShape,
  annotCategories: PropTypes.arrayOf(
    annotCategoryShape.isRequired
  ).isRequired,
  sequence: PropTypes.string.isRequired,
  positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
  selectedPositions: PropTypes.arrayOf(
    PropTypes.number.isRequired
  ).isRequired,
  noBlurSelector: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default function CanvasSequenceViewer({
  size,
  className,
  annotations,
  seqFragment,
  curAnnotNameLookup,
  annotCategories,
  sequence,
  positionLookup,
  selectedPositions,
  noBlurSelector,
  onChange
}) {

  useForceUpdateOnResize();

  const [containerRef, containerWidth] = useContainer();

  const config = useConfig({
    size,
    sequence,
    seqFragment,
    annotations,
    positionLookup,
    curAnnotNameLookup,
    annotCategories,
    containerWidth
  });

  const combinedClassName = makeClassNames(
    style['canvas-sequence-viewer'],
    className
  );

  return (
    <div
     ref={containerRef}
     className={combinedClassName}>
      {config === null ? <Loader /> :
      <LegendContext.Consumer>
        {(context) => {
          setTimeout(() => config.updateLegendContext(context));
          return (
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
          );
        }}
      </LegendContext.Consumer>
      }
    </div>
  );

}
