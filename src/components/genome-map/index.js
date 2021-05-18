import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {presetShape} from './prop-types';
import RegionGroup from './region-group';
import Markdown from '../markdown';
import DownloadSVG from '../download-svg';

import style from './style.module.scss';

export {presetShape};


export default class GenomeMap extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    extraButtons: PropTypes.node,
    preset: presetShape.isRequired
  }

  constructor() {
    super(...arguments);
    this.svgRef = React.createRef();
    const {preset: {height, width, paddingLeft, paddingRight}} = this.props;
    this.state = {height, width, paddingLeft, paddingRight};
    this._mounted = false;
  }

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  moveSVGBorder = ({height, width, paddingLeft, paddingRight}) => {
    if (this._mounted && height > this.state.height) {
      this.setState({height, width, paddingLeft, paddingRight});
    }
  }

  render() {
    const {
      className,
      extraButtons,
      preset: {
        name,
        paddingTop,
        domains,
        hidePositionAxis,
        positionAxis,
        positionGroups,
        regions,
        coverages,
        subregionGroup,
        footnote
      }
    } = this.props;
    const {height, width, paddingLeft, paddingRight} = this.state;
    return <div className={classNames(
      style['map-container'], className
    )}>
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
           coverages={coverages}
           moveSVGBorder={this.moveSVGBorder}
           subregionGroup={subregionGroup} />
        </svg>
      </div>
      {footnote && <div className={style.footnote}>
        <Markdown escapeHtml={false}>{footnote}</Markdown>
      </div>}
    </div>;
  }

}
