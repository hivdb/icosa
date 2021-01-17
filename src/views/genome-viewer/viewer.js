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
import PromiseComponent from '../../utils/promise-component';

import PresetSelection from './preset-selection';
import style from './style.module.scss';


class GenomeViewer extends React.Component {

  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired
      }).isRequired
    ).isRequired,
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
      options,
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
    return <div className={style['viewer-container']}>
      <div className={style['button-group']}>
        <PresetSelection as="div" options={options} />
        <DownloadSVG
         css="none"
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


export default class GenomeViewerLoader extends React.Component {

  static propTypes = {
    presetLoader: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    const {
      presetLoader
    } = props;
    if (state.presetLoader === presetLoader) {
      return null;
    }
    
    return {
      presetLoader,
      promise: (async () => {
        const {presets, ...preset} = await presetLoader();
        const options = presets.map(({name, label}) => ({value: name, label}));
        return {options, preset};
      })()
    };
  }

  constructor() {
    super(...arguments);
    this.state = this.constructor.getDerivedStateFromProps(this.props, {});
  }

  render() {
    const {promise} = this.state;
    return <>
      <PromiseComponent
       promise={promise}
       component={GenomeViewer} />
    </>;
  }

}
