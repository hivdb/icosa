import React from 'react';
import PropTypes from 'prop-types';

import {
  regionShape,
  positionGroupsShape,
  domainsShape,
  positionAxisShape
} from './prop-types';
import RegionGroup from './region-group';
import Markdown from '../../components/markdown';
import DownloadSVG from '../../components/download-svg';

import style from './style.module.scss';


export default class GenomeViewer extends React.Component {

  static propTypes = {
    preset: PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      paddingTop: PropTypes.number.isRequired,
      paddingRight: PropTypes.number.isRequired,
      paddingLeft: PropTypes.number.isRequired,
      domains: domainsShape.isRequired,
      positionAxis: positionAxisShape,
      positionGroups: positionGroupsShape,
      regions: PropTypes.arrayOf(
        regionShape.isRequired
      ).isRequired,
      subregionGroup: PropTypes.shape({
        name: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        posStart: PropTypes.number.isRequired,
        posEnd: PropTypes.number.isRequired,
        regions: PropTypes.arrayOf(
          regionShape.isRequired
        ).isRequired,
        footnote: PropTypes.string
      })
    }).isRequired
  }

  constructor() {
    super(...arguments);
    this.svgRef = React.createRef();
  }

  render() {
    const {
      preset: {
        name,
        width,
        height,
        paddingTop,
        paddingRight,
        paddingLeft,
        domains,
        positionAxis,
        positionGroups,
        regions,
        subregionGroup,
        footnote
      }
    } = this.props;
    return <div>
      <div>
        <DownloadSVG target={this.svgRef} fileName={`${name}.svg`} />
      </div>
      <div className={style['viewer-container']}>
        <svg
         ref={this.svgRef}
         width={`${width}px`}
         height={`${height}px`}
         className={style['genome-svg']}
         viewBox={`0 0 ${width} ${height}`}>
          <RegionGroup
           paddingTop={paddingTop}
           paddingRight={paddingRight}
           paddingLeft={paddingLeft}
           width={width}
           domains={domains}
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
