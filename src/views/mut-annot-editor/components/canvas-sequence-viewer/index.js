import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import Loader from 'react-loader';

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
  posShape, seqViewerSizeType} from '../../prop-types';


export default class CanvasSequenceViewer extends React.Component {

  static propTypes = {
    size: seqViewerSizeType.isRequired,
    className: PropTypes.string,
    curAnnotNameLookup: curAnnotNameLookupShape,
    annotCategories: PropTypes.arrayOf(
      annotCategoryShape.isRequired
    ).isRequired,
    sequence: PropTypes.string.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.containerRef = createRef();
  }

  get config() {
    const {
      size,
      sequence,
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
    let aaAnnotIdx = 0;
    for (const cat of annotCategories) {
      const {name: catName, annotStyle} = cat;
      const curAnnotNames = curAnnotNameLookup[catName] || [];
      const curAnnot = (
        annotations.find(({name}) => curAnnotNames.includes(name))
      );
      switch (annotStyle) {
        case 'colorBox':
          colorBoxPositions = getAnnotPositions(
            curAnnot, positionLookup
          );
          break;
        case 'circleInBox':
          circleInBoxPositions = getAnnotPositions(
            curAnnot, positionLookup
          );
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
            curAnnot, positionLookup, aaAnnotIdx ++
          );
          aminoAcidsCatNames.push(catName);
          break;
        default:
          break;
      }
    }

    const {containerWidth} = this;
    if (containerWidth) {
      return new ConfigGenerator({
        sizeName: size,
        canvasWidthPixel: containerWidth,
        seqLength: sequence.length,
        colorBoxPositions,
        circleInBoxPositions,
        underscoreAnnotLocations,
        underscoreAnnotNames,
        aminoAcidsAnnotPositions,
        aminoAcidsCatNames
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
    return current.clientWidth;
  }

  render() {
    const {config} = this;
    const {
      className, sequence,
      selectedPositions,
      annotCategories,
      positionLookup, onChange
    } = this.props;
    const combinedClassName = makeClassNames(
      style['canvas-sequence-viewer'], className
    );

    return (
      <div
       ref={this.containerRef}
       className={combinedClassName}>
        {config === null ? <Loader loaded={false} /> :
        <LegendContext.Consumer>
          {(context) => {
            config.updateLegendContext(context);
            return (
              <SeqViewerStage
               {...{
                 config,
                 sequence,
                 annotCategories,
                 positionLookup,
                 selectedPositions,
                 onChange}} />
            );
          }}
        </LegendContext.Consumer>
        }
      </div>
    );
  }

}
