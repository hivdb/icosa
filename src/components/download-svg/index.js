import React from 'react';
import PropTypes from 'prop-types';
import getSource from 'svg-crowbar/dist/esm/inputProcessor';

import Button from '../button';
import {makeDownload} from '../../utils/download';

import style from './style.module.scss';


export default class DownloadSVG extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    target: PropTypes.oneOfType([
      PropTypes.instanceOf(Element).isRequired,
      PropTypes.shape({
        'current': PropTypes.instanceOf(Element)
      })
    ]),
    fileName: PropTypes.string,
    css: PropTypes.oneOf(['internal', 'inline', 'none']).isRequired,
    children: PropTypes.node.isRequired
  }

  static defaultProps = {
    name: 'download-svg',
    css: 'inline',
    children: 'Download SVG'
  }

  handleClick = async e => {
    e && e.preventDefault();
    let {target, fileName, css} = this.props;
    if (target.current) {
      target = target.current;
    }
    if (target instanceof Element) {
      target = target.cloneNode(true);
      const container = document.createElement('div');
      container.className = style['svg-download-container'];
      container.appendChild(target);
      for (const elem of container.querySelectorAll('*[id]')) {
        elem.id = `sd-${elem.id}`;
      }
      document.body.appendChild(container);
      const {source} = getSource(target, {css});
      makeDownload(fileName, 'image/svg+xml', source);
      setTimeout(() => document.body.removeChild(container));
    }
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const {children, target, fileName, ...props} = this.props;

    return (
      <Button
       {...props}
       onClick={this.handleClick}>
        {children}
      </Button>
    );
  }

}
