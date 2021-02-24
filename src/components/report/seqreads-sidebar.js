import React from 'react';
import PropTypes from 'prop-types';

import Paginator from '../paginator';

import style from './style.module.scss';


export default class SeqReadsSidebar extends React.Component {

  static propTypes = {
    allSequenceReads: PropTypes.array.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }),
    onSelect: PropTypes.func
  }

  constructor() {
    super(...arguments);
    this.containerRef = React.createRef();
    this.state = {fixed: false};
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleWindowScroll, false);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleWindowScroll, false);
  }

  handleWindowScroll = evt => {
    const {prevFixed} = this.state;
    const {top} = this.containerRef.current.getBoundingClientRect();
    const fixed = top === 0;
    if (fixed !== prevFixed) {
      this.setState({fixed});
    }
  }

  handleClick(e, seqReads) {
    e && e.preventDefault();
    const {onSelect} = this.props;
    onSelect && onSelect(seqReads);
  }

  render() {
    const {fixed} = this.state;
    const {allSequenceReads, currentSelected} = this.props;

    return (
      <div
       ref={this.containerRef}
       data-fixed={fixed}
       className={style['sequence-paginator-container']}>
        <Paginator
         footnote={<>
           This submission contains {allSequenceReads.length} sequences.
         </>}
         currentSelected={currentSelected.name}>
          {allSequenceReads
            .map((seqReads, idx) => (
              <Paginator.Item
               key={idx}
               name={seqReads.name}
               href={`#${seqReads.name}`}
               onClick={(e) => this.handleClick(e, seqReads)}>
                {seqReads.name}
              </Paginator.Item>
          ))}
        </Paginator>
      </div>
    );
  }

}
