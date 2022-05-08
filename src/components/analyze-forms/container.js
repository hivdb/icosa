import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.module.scss';


export default class AnalyzeFormsContainer extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node
  };

  render() {
    const {className, children} = this.props;

    return (
      <section className={classNames(style['analyze-form-tabs'], className)}>
        {children}
      </section>
    );
  }

}
