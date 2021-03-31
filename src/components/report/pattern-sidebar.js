import React from 'react';
import PropTypes from 'prop-types';

import Paginator from '../paginator';

import style from './style.module.scss';


export default class PatternSidebar extends React.Component {

  static propTypes = {
    patterns: PropTypes.array.isRequired,
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
    const {patterns, currentSelected} = this.props;

    return (
      <div
       ref={this.containerRef}
       data-fixed={fixed}
       className={style['sequence-paginator-container']}>
        <Paginator
         footnote={<>
           This submission contains {patterns.length} sequences.
         </>}
         currentSelected={currentSelected.name}>
          {patterns
            .map((pattern, idx) => (
              <Paginator.Item
               key={idx}
               name={pattern.name}
               href={`#${pattern.name}`}
               onClick={(e) => this.handleClick(e, pattern)}>
                {pattern.name}
              </Paginator.Item>
          ))}
        </Paginator>
      </div>
    );
  }

}
