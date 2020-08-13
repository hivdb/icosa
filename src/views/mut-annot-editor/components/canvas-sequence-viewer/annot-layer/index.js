import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import {annotShape} from '../../../prop-types';
import PosAnnotGroup from './posannot-group';
import {posByAnnotShape} from './prop-types';


export default class AnnotLayer extends React.Component {

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
    const reversed = [...positionsByAnnot].reverse();
    const lastIdx = reversed.length - 1;
    const opDelim = Math.ceil(reversed.length / 2) - 1;

    return (
      <Layer>
        {reversed.map(({
          annot: {level}, positions
        }, idx) => (level === 'position' ?
          <PosAnnotGroup
           key={idx}
           numAnnots={lastIdx + 1}
           annotIndex={idx}
           opacity={
             opDelim === 0 ? 1 : 1 - 0.6 * Math.floor(idx / 2) / opDelim
           }
           {...{config, positions}} />
          : null
        ))}
      </Layer>
    );


  }

}
