import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PosAnnotGroup from './posannot-group';


export default class ExtraAnnotsLayer extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired
  }

  shouldComponentUpdate(nextProps) {
    return this.props.config.getHash() !== nextProps.config.getHash();
  }

  render() {
    const {config} = this.props;

    return (
      <Layer>
        <PosAnnotGroup {...{config}} />
      </Layer>
    );


  }

}
