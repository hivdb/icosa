import React from 'react';
import PropTypes from 'prop-types';

import PseudoItem from './pseudo-item';
import PaginatorItem from './paginator-item';
import PaginatorArrow from './paginator-arrow';
import ScrollBar from './scroll-bar';
import style from './style.module.scss';


export default class Paginator extends React.Component {

  static propTypes = {
    currentSelected: PropTypes.string,
    children: PropTypes.node.isRequired
  }

  static Item = PseudoItem

  static getDerivedStateFromProps(props) {
    let {children} = props;
    if (!(children instanceof Array)) {
      children = [children];
    }
    const childItems = children.map(node => node.props);
    return {childItems};
  }

  static getIndex(findName, childItems) {
    return childItems.findIndex(({name}) => name === findName);
  }

  constructor() {
    super(...arguments);
    const {currentSelected} = this.props;
    const displayNums = 10;
    const addState = this.constructor.getDerivedStateFromProps(this.props);
    this.state = {
      displayNums,
      currentHovering: null,
      scrollOffset: Math.min(
        Math.max(
          this.constructor.getIndex(
            currentSelected, addState.childItems
          ) - parseInt(displayNums / 2) + 1,
          0
        ),
        addState.childItems.length - displayNums
      ),
      ...addState
    };
  }

  setCurrentHovering = name => {
    this.setState({currentHovering: name});
  }

  handleScroll = direction => {
    let {scrollOffset, childItems, displayNums} = this.state;
    scrollOffset += direction;
    let rejectFlag = false;
    const maxOffset = childItems.length - displayNums;
    if (scrollOffset < 0) {
      scrollOffset = 0;
      rejectFlag = true;
    }
    else if (scrollOffset > maxOffset) {
      scrollOffset = maxOffset;
      rejectFlag = true;
    }
    this.setState({scrollOffset});
    return rejectFlag;
  }

  handleArrowClick = direction => {
    const {currentSelected} = this.props;
    const {childItems} = this.state;
    let index = this.constructor.getIndex(currentSelected, childItems);
    const childProps = childItems[index + direction];
    if (childProps) {
      childProps.onClick();
    }
    this.handleScroll(direction);
  }

  render() {
    const {currentSelected} = this.props;
    const {
      childItems, currentHovering,
      scrollOffset, displayNums
    } = this.state;
    const currentSelectedIndex = childItems.findIndex(
      ({name}) => name === currentSelected
    );
    const currentHoveringIndex = childItems.findIndex(
      ({name}) => name === currentHovering
    );

    const offset = currentSelectedIndex;
    let descIndex = currentSelectedIndex;
    let hoverOffset = 0;
    if (currentHoveringIndex > -1) {
      descIndex = currentHoveringIndex;
      hoverOffset = Math.sqrt(
        Math.abs(
          currentSelectedIndex - currentHoveringIndex
        )
      );
      if (currentSelectedIndex > currentHoveringIndex) {
        hoverOffset = - hoverOffset;
      }
    }

    return (
      <nav
       style={{
         '--offset': offset - scrollOffset,
         '--hover-offset': hoverOffset,
         '--scroll-offset': scrollOffset,
         '--total': childItems.length,
         '--display-nums': displayNums
       }}
       className={style['paginator-container']}>
        <div
         className={style['paginator-desc']}
         data-is-hovering={!!currentHovering}
         data-is-hovering-selected={currentHovering === currentSelected}>
          {descIndex + 1}{'. '}
          {currentHovering || currentSelected}
        </div>
        <PaginatorArrow direction={-1} onClick={this.handleArrowClick} />
        <div className={style['paginator-scrollable-list']}>
          <ol
           className={style['paginator-list']}>
            {childItems.map((props, idx) => (
              <PaginatorItem
               key={idx}
               {...props} 
               currentSelected={currentSelected}
               currentHovering={currentHovering}
               setCurrentHovering={this.setCurrentHovering} />
            ))}
          </ol>
        </div>
        <PaginatorArrow direction={1} onClick={this.handleArrowClick} />
        <ScrollBar onScroll={this.handleScroll} />
      </nav>
    );
  }

}
