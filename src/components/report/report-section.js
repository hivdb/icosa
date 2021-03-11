import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


function ReportSection(props) {
  const {title, titleAnnotation, children} = props;

  return (
    <section className={style['report-section']}>
      <h2>{title}</h2>
      {titleAnnotation ? <div className={style['header-annotation']}>
        {titleAnnotation}
      </div> : null}
      {children}
    </section>
  );
}

ReportSection.propTypes = {
  title: PropTypes.string.isRequired,
  titleAnnotation: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default ReportSection;
