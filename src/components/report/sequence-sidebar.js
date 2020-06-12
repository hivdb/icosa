import React from 'react';
import PropTypes from 'prop-types';

import Sidebar, {SidebarItem} from '../sidebar';



export default class SequenceSidebar extends React.Component {

  static contextTypes = {
    sequenceLoader: PropTypes.func
  }

  static propTypes = {
    sequences: PropTypes.array.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number.isRequired,
      header: PropTypes.string.isRequired
    }),
    onSelect: PropTypes.func
  }

  get sequenceLoader() {
    return this.context.sequenceLoader || (() => {});
  }

  handleClick(e, sequence) {
    e.preventDefault();
    const {onSelect} = this.props;
    this.sequenceLoader(sequence);
    onSelect && onSelect(sequence);
  }

  render() {
    const {sequences, currentSelected} = this.props;
    let isPlural = sequences.length > 1;

    return (
      <Sidebar
       title={isPlural ?
         `Found ${sequences.length} sequences` :
         'Found one sequence'}
       currentSelected={currentSelected.header}>
        {sequences
          .map((seq, idx) => (
            <SidebarItem
             key={idx}
             name={seq.header}
             href={`#${seq.header}`}
             onClick={(e) => this.handleClick(e, seq)}>
              {seq.header}
            </SidebarItem>
        ))}
      </Sidebar>
    );
  }

}
