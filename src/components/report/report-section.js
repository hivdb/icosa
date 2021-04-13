import React from 'react';
import PropTypes from 'prop-types';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import style from './style.module.scss';


function ReportSection({
  collapsable,
  display,
  toggleDisplay,
  title,
  titleAnnotation,
  children
}) {
  return (
    <section className={style['report-section']} data-display={display}>
      <h2>
        {collapsable ? (
          <button
           onClick={toggleDisplay}
           className={style['toggle-display']}>
            {display ? <FaRegMinusSquare /> : <FaRegPlusSquare />}
          </button>
        ) : null}
        {title}
      </h2>
      {titleAnnotation ? <div className={style['header-annotation']}>
        {titleAnnotation}
      </div> : null}
      {collapsable ?
        <div className={style['collapsable-container']} data-display={display}>
          <div className={style['collapsable-content']}>
            {children}
          </div>
        </div> :
        <div>{children}</div>}
    </section>
  );
}

ReportSection.propTypes = {
  collapsable: PropTypes.bool.isRequired,
  display: PropTypes.bool.isRequired,
  toggleDisplay: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleAnnotation: PropTypes.string,
  children: PropTypes.node.isRequired
};


ReportSection.defaultProps = {
  collapsable: false,
  defaultDisplay: true
};

export default ReportSection;
