import React from 'react';
import {matchShape} from 'found';
import PropTypes from 'prop-types';

import {getSeqReadsFromHash} from '../../utils/seqreads-loader';
import memoize from '../../utils/memoize-decorator';

import Sidebar, {SidebarItem} from '../sidebar';


export default class SeqReadsSidebar extends React.Component {

  static propTypes = {
    match: matchShape.isRequired,
    allSequenceReads: PropTypes.array.isRequired,
    onSelect: PropTypes.func
  }

  __hash__() {
    return 'SeqReadsSidebar';
  }

  getCurrentSelected = memoize((match, allSequenceReads) => {
    const {location: {hash}} = match;
    const seqReads = getSeqReadsFromHash(hash, allSequenceReads);
    return seqReads.name;
  });

  handleClick(e, seqReads) {
    e.preventDefault();
    const {onSelect} = this.props;

    onSelect && onSelect(seqReads);
  }

  render() {
    const {match, allSequenceReads} = this.props;
    const currentSelected = this.getCurrentSelected(match, allSequenceReads);
    let isPlural = allSequenceReads.length > 1;

    return (
      <Sidebar
       title={isPlural ?
         `Found ${allSequenceReads.length} sequences` :
         'Found one sequence'}
       currentSelected={currentSelected}>
        {allSequenceReads
          .map((seqReads, idx) => (
            <SidebarItem
             key={idx}
             name={seqReads.name}
             href={`#${seqReads.name}`}
             onClick={(e) => this.handleClick(e, seqReads)}>
              {seqReads.name}
            </SidebarItem>
        ))}
      </Sidebar>
    );
  }

}
