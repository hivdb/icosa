import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PosAnnotGroup from './posannot-group';


export default class AnnotsLayer extends React.Component {

  static propTypes = {
    hoverUSAnnot: PropTypes.shape({
      annotName: PropTypes.string
    }).isRequired,
    config: PropTypes.object.isRequired
  }

  shouldComponentUpdate(nextProps) {
    return (
      JSON.stringify(this.props.hoverUSAnnot) !==
      JSON.stringify(nextProps.hoverUSAnnot) ||
      this.props.config.getHash() !== nextProps.config.getHash()
    );
  }

  render() {
    const {hoverUSAnnot, config} = this.props;

    return (
      <Layer>
        <PosAnnotGroup {...{hoverUSAnnot, config}} />
      </Layer>
    );


  }

}
