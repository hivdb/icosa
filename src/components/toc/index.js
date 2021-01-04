import React from 'react';
import PropTypes from 'prop-types';
import makeClassNames from 'classnames';

import style from './style.module.scss';


export default class BasicTOC extends React.Component {

  static propTypes = {
    children: PropTypes.node,
    className: PropTypes.string
  }

  render() {
    const {children, className} = this.props;
    return (
      <div className={makeClassNames(style['toc-container'], className)}>
        <nav id="_toc" className={style.toc}>
          {children}
        </nav>
      </div>
    );
  }

}


export class AutoTOC extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string
  }

  constructor() {
    super(...arguments);
    this.childrenRef = React.createRef();
  }

  get tocArray() {
    if (!this.childrenRef.current) {
      setTimeout(() => this.forceUpdate());
      return [];
    }
    else {
      return this._getTocArray(
        this.childrenRef.current.querySelectorAll('h1,h2,h3,h4,h5,h6')
      );
    }
  }

  _getTocArray(headers) {
    let tocChildren = [];
    for (const header of headers) {
      tocChildren.push([header.tagName.toLowerCase(), header]);
    }
    return tocChildren;
  }

  tocDom(elem, subtocArray, domList) {
    let {id, textContent: children} = elem;
    children = <a href={`#${id}`}>{children}</a>;
    domList.push(
      <li key={domList.length}>
        {children}
        {this.tocArrayToDom(subtocArray)}
      </li>
    );
  }
  
  
  tocArrayToDom(tocArray) {
    if (tocArray.length === 0) {
      return;
    }
    let [curLevel, curElem] = tocArray.shift();
    let domList = [];
    let subtocArray = [];
    while (tocArray.length > 0) {
      const [level, elem] = tocArray.shift();
      if (level === curLevel) {
        this.tocDom(curElem, subtocArray, domList);
        curElem = elem;
        subtocArray = [];
      }
      else {
        subtocArray.push([level, elem]);
      }
    }
    this.tocDom(curElem, subtocArray, domList);
    if (domList.length > 0) {
      return <ul>{domList}</ul>;
    }
  }
  
  render() {
    const {children, className} = this.props;
    const {tocArray} = this;
    return (
      <>
        <BasicTOC className={className}>
          {this.tocArrayToDom(tocArray)}
        </BasicTOC>
        <div ref={this.childrenRef}>{children}</div>
      </>
    );
  }

}
