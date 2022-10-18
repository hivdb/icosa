import React, {createRef} from 'react';
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


export default class CanvasSequenceViewer extends React.Component {

  static propTypes = {
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

  constructor() {
    super(...arguments);
    this.state = {resizing: false};
    this.containerRef = createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize, false);
  }

  onWindowResize = debounce(() => {
    this.forceUpdate();
  }, 200);

  get config() {
    const {
      size,
      sequence,
      seqFragment,
      annotations,
      positionLookup,
      curAnnotNameLookup,
      annotCategories
    } = this.props;
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

    const {containerWidth} = this;
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
  }

  get containerWidth() {
    const {current} = this.containerRef;
    if (!current) {
      setTimeout(async () => {
        await preloadFonts();
        this.forceUpdate();
      }, 0);
      return null;
    }
    const konva = current.querySelector('.konvajs-content');
    try {
      if (konva) {
        konva.style.display = 'none';
      }
      return current.clientWidth;
    }
    finally {
      if (konva) {
        konva.style.display = null;
      }
    }
  }

  render() {
    const {config} = this;
    const {
      className, sequence,
      selectedPositions,
      annotCategories,
      positionLookup,
      noBlurSelector,
      onChange
    } = this.props;
    const combinedClassName = makeClassNames(
      style['canvas-sequence-viewer'],
      className
    );

    return (
      <div
       ref={this.containerRef}
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

}
