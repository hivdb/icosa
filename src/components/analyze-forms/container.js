import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.module.scss';


AnalyzeFormsContainer.propTypes = {
  tabName: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node
};

export default function AnalyzeFormsContainer({
  className,
  children,
  tabName
}) {

  return (
    <section
     data-tabname={tabName}
     className={classNames(style['analyze-form-tabs'], className)}>
      {children}
    </section>
  );
}
