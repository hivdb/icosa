import React from 'react';
import PropTypes from 'prop-types';

import {presetShape} from './prop-types';
import RegionGroup from './region-group';
import Markdown from '../markdown';
import DownloadSVG from '../download-svg';

import style from './style.module.scss';


export {presetShape} from './prop-types';


export default class GenomeMap extends React.Component {

  static propTypes = {
    extraButtons: PropTypes.node,
    preset: presetShape.isRequired
  }

  constructor() {
    super(...arguments);
    this.svgRef = React.createRef();
  }

  render() {
    const {
      extraButtons,
      preset: {
        name,
        width,
        height,
        paddingTop,
        paddingRight,
        paddingLeft,
        domains,
        hidePositionAxis,
        positionAxis,
        positionGroups,
        regions,
        subregionGroup,
        footnote
      }
    } = this.props;
    return <div className={style['map-container']}>
      <div className={style['button-group']}>
        {extraButtons}
        <DownloadSVG
         css="none"
         btnSize="small"
         btnStyle="primary"
         target={this.svgRef}
         fileName={`${name}.svg`} />
      </div>
      <div className={style['svg-container']}>
        <svg
         ref={this.svgRef}
         width={`${width}px`}
         height={`${height}px`}
         fontFamily='"Source Sans Pro", "Helvetica Neue", Helvetica'
         viewBox={`0 0 ${width} ${height}`}>
          <RegionGroup
           paddingTop={paddingTop}
           paddingRight={paddingRight}
           paddingLeft={paddingLeft}
           width={width}
           domains={domains}
           hidePositionAxis={hidePositionAxis}
           positionAxis={positionAxis}
           positionGroups={positionGroups}
           regions={regions}
           subregionGroup={subregionGroup} />
        </svg>
      </div>
      {footnote && <div className={style.footnote}>
        <Markdown escapeHtml={false}>{footnote}</Markdown>
      </div>}
    </div>;
  }

}
