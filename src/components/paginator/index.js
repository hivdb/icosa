import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import PseudoItem from './pseudo-item';
import PaginatorItem from './paginator-item';
import PaginatorArrow from './paginator-arrow';
import ScrollBar from './scroll-bar';
import style from './style.module.scss';


export default class Paginator extends React.Component {

  static propTypes = {
    footnote: PropTypes.node,
    currentSelected: PropTypes.string,
    className: PropTypes.string,
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
    const itemNums = addState.childItems.length;
    let scrollOffset = 0;
    if (itemNums > displayNums) {
      scrollOffset = Math.min(
        Math.max(
          this.constructor.getIndex(
            currentSelected, addState.childItems
          ) - parseInt(displayNums / 2) + 1,
          0
        ),
        itemNums - displayNums
      );
    }
    
    this.state = {
      displayNums,
      currentHovering: null,
      scrollOffset,
      ...addState
    };
    this.navRef = React.createRef();
  }

  componentDidMount() {
    this.navRef.current.addEventListener(
      'wheel', this.handleWheel, {passive: false}
    );
  }

  componentWillUnmount() {
    this.navRef.current.removeEventListener(
      'wheel', this.handleWheel, {passive: false}
    );
  }

  setCurrentHovering = name => {
    this.setState({currentHovering: name});
  }

  handleScroll = direction => {
    let {scrollOffset, childItems, displayNums} = this.state;
    if (childItems.length <= displayNums) {
      return false;
    }
    scrollOffset += direction;
    let acceptFlag = true;
    const maxOffset = childItems.length - displayNums;
    if (scrollOffset < 0) {
      scrollOffset = 0;
      acceptFlag = false;
    }
    else if (scrollOffset > maxOffset) {
      scrollOffset = maxOffset;
      acceptFlag = false;
    }
    this.setState({scrollOffset});
    return acceptFlag;
  }

  handleWheel = event => {
    let {childItems, displayNums} = this.state;
    if (childItems.length <= displayNums) {
      return;
    }
    event.preventDefault();
    if (!this.wheelAccum) {
      this.wheelAccum = 0;
    }
    const wheelStepWidth = 35;
    const wheelAccum = this.wheelAccum + event.deltaX;
    if (Math.abs(wheelAccum) > wheelStepWidth) {
      let steps = wheelAccum / wheelStepWidth;
      steps = (steps > 0 ? 1 : -1) * Math.floor(Math.sqrt(Math.abs(steps)));
      this.handleScroll(steps);
      this.wheelAccum = 0;
    }
    else {
      this.wheelAccum = wheelAccum;
    }
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
    const {className, currentSelected, footnote} = this.props;
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
       ref={this.navRef}
       style={{
         '--offset': offset - scrollOffset,
         '--hover-offset': hoverOffset,
         '--scroll-offset': scrollOffset,
         '--total': childItems.length,
         '--display-nums': displayNums
       }}
       className={classNames(className, style['paginator-container'])}>
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
        {childItems.length > displayNums ?
          <ScrollBar onScroll={this.handleScroll} /> : null}
        {footnote ? (
          <div className={style['paginator-footnote']}>
            {footnote}
          </div>
        ) : null}
      </nav>
    );
  }

}
