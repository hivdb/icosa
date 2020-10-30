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

  getInitialScrollOffset({childItems, displayNums=10}) {
    const {currentSelected} = this.props;
    const itemNums = childItems.length;
    let scrollOffset = 0;
    if (itemNums > displayNums) {
      scrollOffset = Math.min(
        Math.max(
          this.constructor.getIndex(
            currentSelected, childItems
          ) - parseInt(displayNums / 2) + 1,
          0
        ),
        itemNums - displayNums
      );
    }
    return scrollOffset;
  }

  constructor() {
    super(...arguments);
    const displayNums = 10;
    const addState = this.constructor.getDerivedStateFromProps(this.props);
    const scrollOffset = this.getInitialScrollOffset({
      childItems: addState.childItems,
      displayNums
    });
    
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
    window.addEventListener(
      '--sierra-paginator-reset-scroll',
      this.resetScrollOffset,
      false
    );
  }

  resetScrollOffset = () => {
    const scrollOffset = this.getInitialScrollOffset(this.state);
    this.setState({scrollOffset});
  }

  componentWillUnmount() {
    this.navRef.current.removeEventListener(
      'wheel', this.handleWheel, {passive: false}
    );
    window.removeEventListener(
      '--sierra-paginator-reset-scroll',
      this.resetScrollOffset,
      false
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
    if (!this.wheelAccumX) {
      this.wheelAccumX = 0;
      this.wheelAccumY = 0;
    }
    const wheelStepWidth = 40;
    const wheelAccumX = this.wheelAccumX + event.wheelDeltaX;
    const wheelAccumY = this.wheelAccumY + event.wheelDeltaY;
    const wheelAccum = Math.sqrt(
      Math.pow(wheelAccumX, 2) + Math.pow(wheelAccumY, 2)
    );
    let direction = 1;
    if (Math.abs(wheelAccumX) > Math.abs(wheelAccumY)) {
      direction = wheelAccumX > 0 ? -1 : 1;
    }
    else {
      direction = wheelAccumY > 0 ? -1 : 1;
    }
    if (wheelAccum > wheelStepWidth) {
      let steps = wheelAccum / wheelStepWidth;
      steps = direction * Math.floor(Math.sqrt(steps));
      this.handleScroll(steps);
      this.wheelAccumX = 0;
      this.wheelAccumY = 0;
    }
    else {
      this.wheelAccumX = wheelAccumX;
      this.wheelAccumY = wheelAccumY;
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
