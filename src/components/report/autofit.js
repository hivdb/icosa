import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';

export default class AutofitGraph extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
    onResize: PropTypes.func.isRequired,
    output: PropTypes.string.isRequired
  };

  get isPrint() {
    return this.props.output === 'printable';
  }

  constructor() {
    super(...arguments);
    this.sectionRef = React.createRef();
  }

  componentDidMount() {
    if (!this.isPrint) {
      let prevContainerWidth;
      this._resizeEvent = () => {
        // automatically resize container width
        if (this.sectionRef.current) {
          const containerWidth = this.sectionRef.current.clientWidth;
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
       ref={this.sectionRef}
       className={style['report-sequence-qa']}>
        {children}
      </section>
    );
  }

}
