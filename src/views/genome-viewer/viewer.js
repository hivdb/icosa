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

  render() {
    const {
      preset: {
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
      <div className={style['viewer-container']}>
        <svg
         width={`${width}px`}
         height={`${height}px`}
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
