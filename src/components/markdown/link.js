import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';


export default class MarkdownLink extends React.Component {

  static propTypes = {
    href: PropTypes.string.isRequired
  }

  getTarget(href, props) {
    let {target} = props;
    if (target) {
      return target;
    }
    if (/^(https?:\/\/|\/\/)/gi.test(href)) {
      return '_blank';
    }
    return null;
  }

  renderLink(href, props) {
    const {children, ...others} = props;
    const target = this.getTarget(href, props);
    if (!href.startsWith('#') && target == null) {
      return <Link to={href} {...props} />;
    }
    else {
      return (
        <a href={href}
         {...others}
         rel="noopener noreferrer"
         target={target}>
          {children}
        </a>
      );
    }
  }

  render() {
    let type = 'link';
    let {href, ...props} = this.props;
    if (href.startsWith('!')) {
      [type, href] = href.split(/:/);
      type = type.slice(1);
      href = href ? href.trim() : href;
    }
    switch (type) {
      // case 'gist':
      //   return this.renderGist(href, props);
      case 'link':
      default:
        return this.renderLink(href, props);
    }
  }
}
