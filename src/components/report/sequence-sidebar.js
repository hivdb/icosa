import React from 'react';
import PropTypes from 'prop-types';

import Paginator from '../paginator';


export default class SequenceSidebar extends React.Component {

  static propTypes = {
    sequences: PropTypes.array.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number.isRequired,
      header: PropTypes.string.isRequired
    }),
    onSelect: PropTypes.func
  }

  handleClick(e, sequence) {
    e && e.preventDefault();
    const {onSelect} = this.props;
    onSelect && onSelect(sequence);
  }

  render() {
    const {sequences, currentSelected} = this.props;

    return (
      <Paginator
       footnote={<>
         This submission contains {sequences.length} sequences.
       </>}
       currentSelected={currentSelected.header}>
        {sequences
          .map((seq, idx) => (
            <Paginator.Item
             key={idx}
             name={seq.header}
             href={`#${seq.header}`}
             onClick={(e) => this.handleClick(e, seq)}>
              {seq.header}
            </Paginator.Item>
        ))}
      </Paginator>
    );
  }

}
