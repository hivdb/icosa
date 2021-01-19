import React from 'react';
import PropTypes from 'prop-types';

import GenomeMap, {
  presetShape
} from '../../components/genome-map';
import PromiseComponent from '../../utils/promise-component';

import PresetSelection from './preset-selection';


function GenomeViewer({options, preset}) {
  return <>
    <GenomeMap
     preset={preset}
     extraButtons={<>
       <PresetSelection as="div" options={options} />
     </>} />
  </>;
}

GenomeViewer.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired
    }).isRequired
  ).isRequired,
  preset: presetShape.isRequired
};


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
