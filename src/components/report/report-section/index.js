import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {FaRegPlusSquare} from '@react-icons/all-files/fa/FaRegPlusSquare';
import {FaRegMinusSquare} from '@react-icons/all-files/fa/FaRegMinusSquare';

import style from './style.module.scss';


ReportSection.propTypes = {
  className: PropTypes.string,
  collapsable: PropTypes.bool.isRequired,
  display: PropTypes.bool.isRequired,
  toggleDisplay: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleAnnotation: PropTypes.node,
  children: PropTypes.node.isRequired
};


ReportSection.defaultProps = {
  collapsable: false,
  display: true,
  toggleDisplay: () => null
};

export default function ReportSection({
  className,
  collapsable,
  display,
  toggleDisplay,
  title,
  titleAnnotation,
  children,
  ...props
}) {
  return (
    <section
     {...props}
     className={classNames(
       style['report-section'],
       className
     )} data-display={display}>
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
