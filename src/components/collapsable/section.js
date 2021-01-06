import React from 'react';
import PropTypes from 'prop-types';
import {FaPlusCircle} from '@react-icons/all-files/fa/FaPlusCircle';
import {FaMinusCircle} from '@react-icons/all-files/fa/FaMinusCircle';
import Children from 'react-children-utilities';
import {withRouter, matchShape, routerShape} from 'found';

import {getAnchor, HeadingTag} from '../heading-tags';

import Context from './context';
import style from './style.module.scss';


class SectionInner extends React.Component {

  static propTypes = {
    level: PropTypes.number.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.node.isRequired,
      PropTypes.func.isRequired
    ]),
    match: matchShape.isRequired,
    router: routerShape.isRequired,
    registerCollapsableAnchor: PropTypes.func.isRequired,
    getClosestCollapsableAnchor: PropTypes.func.isRequired
  }

  static defaultProps = {
    registerCollapsableAnchor: () => null,
    getClosestCollapsableAnchor: () => ({
      anchor: null,
      shouldCollapseOther: false
    })
  }

  static getCurAnchor = (props) => {
    let {
      match: {location},
      getClosestCollapsableAnchor
    } = props;
    let curHash = null;
    if (location.hash) {
      curHash = location.hash.replace(/^#/, '');
    }
    return getClosestCollapsableAnchor(curHash);
  }

  static getDefaultState = (props, state = {}) => {
    let {
      children,
      registerCollapsableAnchor
    } = props;
    if (state.children) {
      children = state.children;
    }
    let anchor = null;
    const headingChild = Children.deepFind(
      children,
      child => child && child.type === HeadingTag
    );
    if (headingChild) {
      anchor = getAnchor(headingChild);
      registerCollapsableAnchor(anchor);
    }
    const {anchor: curAnchor} = this.getCurAnchor(props);
    return {
      expanded: anchor !== null && anchor === curAnchor,
      isDefaultState: true,
      myAnchor: anchor,
      curAnchor
    };
  }

  static getDerivedStateFromProps = (props, state) => {
    const {
      anchor: curAnchor,
      shouldCollapseOther
    } = this.getCurAnchor(props);
    if (
      curAnchor !== null &&
      (shouldCollapseOther || state.myAnchor === curAnchor) &&
      curAnchor !== state.curAnchor
    ) {
      return this.getDefaultState(props, state);
    }
    return state;
  }

  constructor() {
    super(...arguments);
    const {children} = this.props;
    const state = {
      children: (
        typeof children === 'function' ? children({
          onLoad: this.onLoad
        }) : children
      )
    };
    this.state = {
      ...state,
      ...this.constructor.getDefaultState(this.props, state)
    };
    this.sectionRef = React.createRef();
  }

  get minHeight() {
    if (this.state.isDefaultState) {
      return 'fit-content';
    }
    else if (this.sectionRef.current) {
      return this.sectionRef.current.scrollHeight + 20;
    }
    return null;
  }

  toggleDisplay = (e) => {
    e && e.preventDefault();
    const {expanded} = this.state;
    this.setState({
      expanded: !expanded,
      isDefaultState: false
    });
  }

  onLoad = (e) => {
    setTimeout(() => this.forceUpdate());
  }

  render() {
    const {
      level, match, router,
      registerCollapsableAnchor,  // unused
      getClosestCollapsableAnchor,  // unused
      ...props
    } = this.props;
    const {
      children,
      expanded,
      isDefaultState
    } = this.state;
    const {minHeight} = this;
    if (expanded) {
      props['data-expanded'] = '';
    }
    props['data-level'] = level;
    const eventProps = {
      onTouchStart: this.toggleDisplay,
      onTouchEnd: e => e.preventDefault(),
      onClick: this.toggleDisplay
    };
    if (expanded) {
      props.style = {minHeight};
    }
    if (isDefaultState) {
      props.style = props.style || {};
      props.style.transition = 'none';
    }
    if (minHeight === null) {
      setTimeout(() => this.forceUpdate(), 0);
    }

    return (
      <section {...props} ref={this.sectionRef}>
        <a
         {...eventProps}
         className={style['toggle-display']}
         href="#toggle-display">
          {expanded ?
            <FaMinusCircle aria-label="expand" /> :
            <FaPlusCircle aria-label="collapse" />}
        </a>
        {children}
      </section>
    );
  }

}


class Section extends React.Component {

  render() {
    return <Context.Consumer>
      {({
        registerCollapsableAnchor,
        getClosestCollapsableAnchor
      }) => (
        <SectionInner
         {...this.props}
         {...{
           registerCollapsableAnchor,
           getClosestCollapsableAnchor
         }} />
      )}
    </Context.Consumer>;
  }

}


export default withRouter(Section);
