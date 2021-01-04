import PropTypes from 'prop-types';
import React from 'react';
import sleep from 'sleep-promise';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import Children from 'react-children-utilities';

import style from './style.module.scss';


export function getChildrenText(elem) {
  return Children.onlyText(elem);
}


export function getAnchor(elem) {
  if (elem.type === HeadingTag) {
    elem = elem.props.children;
  }
  return getChildrenText(elem).toLowerCase().replace(/[^\w-]+/g, '.');
}


export class HeadingTag extends React.Component {

  static propTypes = {
    id: PropTypes.string,
    level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
    children: PropTypes.node.isRequired,
    disableAnchor: PropTypes.bool.isRequired
  }

  static defaultProps = {
    disableAnchor: false
  }

  constructor() {
    super(...arguments);
    this.elemRef = React.createRef();
  }

  get anchor() {
    const {children, id} = this.props;
    return id ? id : getAnchor(children);
  }

  async componentDidMount() {
    if (window.location.hash.replace(/^#/, '') === this.anchor) {
      await sleep(0);
      const top = (
        this.elemRef.current.getBoundingClientRect().top + window.pageYOffset
      );
      window.scrollTo(0, top);
    }
  }

  render() {
    const {level, children, disableAnchor, ...props} = this.props;
    const Tag = `h${level}`;
    return (
      <Tag
       {...props}
       ref={this.elemRef}
       className={style['heading-tag']}
       id={this.anchor}>
        {disableAnchor ? null :
        <a
         href={`#${this.anchor}`}
         className={style['anchor-link']}
         data-anchor-link="">
          <FaLink name="linkify" />
        </a>}
        {children}
      </Tag>
    );
  }

}


export class H1 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={1} />;
  }
}


export class H2 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={2} />;
  }
}


export class H3 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={3} />;
  }
}


export class H4 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={4} />;
  }
}


export class H5 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={5} />;
  }
}


export class H6 extends React.Component {
  render() {
    return <HeadingTag {...this.props} level={6} />;
  }
}
