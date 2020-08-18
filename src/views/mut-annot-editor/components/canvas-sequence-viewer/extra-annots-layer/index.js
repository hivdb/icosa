import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import {annotShape} from '../../../prop-types';
import PosAnnotGroup from './posannot-group';
import {posByAnnotShape} from './prop-types';


export default class ExtraAnnotsLayer extends React.Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    positionsByAnnot: PropTypes.arrayOf(
      PropTypes.shape({
        annot: annotShape.isRequired,
        positions: PropTypes.arrayOf(posByAnnotShape.isRequired),
        aminoAcids: PropTypes.arrayOf(
          PropTypes.shape({
            position: PropTypes.number.isRequired,
            aminoAcids: PropTypes.arrayOf(
              PropTypes.string.isRequired
            ).isRequired
          }).isRequired
        )
      })
    )
  }

  render() {
    const {config, positionsByAnnot} = this.props;
    const lastIdx = positionsByAnnot.length - 1;

    return (
      <Layer>
        {positionsByAnnot.map(({
          annot: {name, level}, positions
        }, idx) => (level === 'position' ?
          <PosAnnotGroup
           key={idx}
           annotName={name}
           numAnnots={lastIdx + 1}
           annotIndex={idx}
           {...{config, positions}} />
          : null
        ))}
      </Layer>
    );


  }

}
