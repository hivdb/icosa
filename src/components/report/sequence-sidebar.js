import React from 'react';
import PropTypes from 'prop-types';

import Paginator from '../paginator';

import style from './style.module.scss';


export default class SequenceSidebar extends React.Component {

  static propTypes = {
    sequences: PropTypes.array.isRequired,
    currentSelected: PropTypes.shape({
      index: PropTypes.number.isRequired,
      header: PropTypes.string.isRequired
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

  handleClick(e, sequence) {
    e && e.preventDefault();
    const {onSelect} = this.props;
    onSelect && onSelect(sequence);
  }

  render() {
    const {fixed} = this.state;
    const {sequences, currentSelected} = this.props;

    return (
      <div
       ref={this.containerRef}
       data-fixed={fixed}
       className={style['sequence-paginator-container']}>
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
      </div>
    );
  }

}
