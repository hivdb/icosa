import React from 'react';
import PropTypes from 'prop-types';

import {getSeqReadsFromHash} from '../../utils/seqreads-loader';

import Sidebar, {SidebarItem} from '../sidebar';


export default class SeqReadsSidebar extends React.Component {

  static contextTypes = {
    location: PropTypes.object.isRequired,
    seqReadsLoader: PropTypes.func,
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    allSequenceReads: PropTypes.array.isRequired,
    onSelect: PropTypes.func
  }

  constructor() {
    super(...arguments);
    this.state = {
      currentSelected: null
    };
  }

  get seqReadsLoader() {
    return this.context.seqReadsLoader || (() => {});
  }

  loadSeqReadsFromLocation(location, router, allSeqReads, onSelect) {
    const seqReads = getSeqReadsFromHash(location.hash, allSeqReads);
    const selected = seqReads.name;
    if (selected !== this.state.currentSelected) {
      this.seqReadsLoader(seqReads);
      onSelect && onSelect(seqReads);
    }
    this.setState({currentSelected: selected});
  }

  componentDidMount() {
    const {allSequenceReads, onSelect} = this.props;
    const {location, router} = this.context;
    this.loadSeqReadsFromLocation(
      location, router, allSequenceReads, onSelect);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextContext.location.hash === this.context.location.hash) {
      return;
    }
    const {allSequenceReads, onSelect} = nextProps;
    const {location, router} = nextContext;
    this.loadSeqReadsFromLocation(location, router, allSequenceReads, onSelect);
  }

  handleClick(e, seqReads) {
    e.preventDefault();
    const hash = e.currentTarget.getAttribute('href');
    const {onSelect} = this.props;

    this.seqReadsLoader(seqReads);
    onSelect && onSelect(seqReads);
    // reset query
    const {query, search, ...loc} = this.context.location;
    this.context.router.push({...loc, hash});
  }

  render() {
    const {allSequenceReads} = this.props;
    const {currentSelected} = this.state;
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
