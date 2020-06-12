import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';

export default class AutofitGraph extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    onResize: PropTypes.func.isRequired,
    output: PropTypes.string.isRequired
  }

  get isPrint() {
    return this.props.output === 'printable';
  }

  componentDidMount() {
    if (!this.isPrint) {
      let prevContainerWidth;
      this._resizeEvent = () => {
        // automatically resize container width
        if (this.refs.section) {
          const containerWidth = this.refs.section.clientWidth;
          if (containerWidth !== prevContainerWidth) {
            prevContainerWidth = containerWidth;
            this.props.onResize({width: containerWidth});
          }
        }
      };
      window.addEventListener('resize', this._resizeEvent);
      this._resizeEvent();
      setTimeout(this._resizeEvent);
    }
  }

  componentWillUnmount() {
    if (!this.isPrint) {
      window.removeEventListener('resize', this._resizeEvent);
    }
  }

  render() {
    const {children} = this.props;

    return (
      <section
       ref="section"
       className={style.reportSequenceQa}>
        {children}
      </section>
    );
  }

}
