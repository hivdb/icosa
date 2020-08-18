import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';
import Loader from 'react-loader';

import style from './style.module.scss';
import ConfigGenerator, {preloadFonts} from './config-generator';
import SeqViewerStage from './stage';

import {getHighlightedPositions} from './funcs';

import {annotShape, posShape, seqViewerSizeType} from '../../prop-types';


export default class CanvasSequenceViewer extends React.Component {

  static propTypes = {
    size: seqViewerSizeType.isRequired,
    className: PropTypes.string,
    curAnnot: annotShape,
    extraAnnots: PropTypes.arrayOf(
      annotShape.isRequired
    ).isRequired,
    sequence: PropTypes.string.isRequired,
    positionLookup: PropTypes.objectOf(posShape.isRequired).isRequired,
    selectedPositions: PropTypes.arrayOf(
      PropTypes.number.isRequired
    ).isRequired,
    displayCitationIds: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments);
    this.containerRef = createRef();
  }

  get config() {
    const {
      size, sequence,
      positionLookup, extraAnnots,
      curAnnot, displayCitationIds
    } = this.props;
    const highlightedPositions = getHighlightedPositions(
      curAnnot, positionLookup, displayCitationIds
    );
    const {colorRules = []} = curAnnot;
    const {containerWidth} = this;
    if (containerWidth) {
      return new ConfigGenerator({
        sizeName: size,
        canvasWidthPixel: containerWidth,
        seqLength: sequence.length,
        annotLevel: curAnnot.level,
        highlightedPositions,
        extraAnnotNames: extraAnnots.map(({name}) => name),
        colorRules
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
      curAnnot, extraAnnots,
      selectedPositions,
      displayCitationIds,
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
        <SeqViewerStage
         {...{
           config,
           curAnnot,
           extraAnnots,
           sequence,
           positionLookup,
           selectedPositions,
           displayCitationIds,
           onChange}} />
        }
      </div>
    );
  }

}
